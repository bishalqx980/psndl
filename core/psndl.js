async function fetch_database(database_path = "./core/database.json") {
    try {
        const response = await fetch(database_path);

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            const errorText = await response.text();
            alert(`Error (${response.status}): ${errorText}`);
            return
        }
    } catch (error) {
        alert(error);
    }
}

async function searchDB(gameName, filteredGameType="null") {
    if (!gameName) {
        alert("Game Name / Search key wasn't given!");
        return
    }

    const database = await fetch_database();
    if (!database) {
        return
    }

    const filtered_data = {}

    for (const game_type in database) {
        if (filteredGameType != "null" && filteredGameType != game_type) {
            continue
        }
        
        const filtered_type = database[game_type];

        for (const region in filtered_type) {
            const filtered_region = filtered_type[region];

            for (const game_id in filtered_region) {
                const filtered_game_data = filtered_region[game_id];

                if (filtered_game_data["name"].toLowerCase().includes(gameName.toLowerCase())) {
                    if (!filtered_data[game_type]) {
                        filtered_data[game_type] = {};
                    }
                    
                    filtered_data[game_type][game_id] = filtered_game_data;
                }
            }
        }
    }

    return Object.keys(filtered_data).length > 0 ? filtered_data : null;
}

function downloadRap(rapName, rapHexData) {
    if (!rapHexData) {
        alert("There is no Rap data for this package.");
        return
    }
    
    const bytes = [];
    for (let i = 0; i < rapHexData.length; i += 2) {
        bytes.push(parseInt(rapHexData.substr(i, 2), 16));
    }

    const byteArray = new Uint8Array(bytes);
    const rapBlob = new Blob([byteArray], { type: "application/octet-stream" });

    const url = URL.createObjectURL(rapBlob);
    const a = document.createElement("a");

    a.href = url;
    a.download = rapName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
