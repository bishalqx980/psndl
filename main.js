document.addEventListener("DOMContentLoaded", async function() {
    const copyrightYear = document.getElementById("copyrightYear");
    const date = new Date();
    const currentYear = date.getFullYear();

    if (currentYear == "2025") {
        copyrightYear.innerHTML = "2025";
    } else {
        copyrightYear.innerHTML = `2025 - ${currentYear}`;
    }

    // Loading Database
    showMsg("<h2 style='color: red;'>Loading database, please wait!</h2>");

    const startTime = performance.now();
    const contentArea = document.getElementById("content_area");
    let loadedPackageCount = 0;
    
    const database = await fetch_database();
    if (database) {
        for (const packageType in database) {
            for (const packageRegion in database[packageType]) {
                for (const packageID in database[packageType][packageRegion]) {
                    // const packageData = database[packageType][packageRegion][packageID];

                    loadedPackageCount += 1;
                    showMsg("Package loaded: " + loadedPackageCount);
                }
            }
        }

        const endTime = performance.now();
        showMsg("Total package loaded " + loadedPackageCount + " in " + ((endTime - startTime) / 1000).toFixed(2) + "sec");
        contentArea.innerHTML = "<p>Search for package...</p>";
    } else {
        showMsg("<h2 style='color: red;'>Something went wrong! Database isn't loaded!</h2>");
        contentArea.innerHTML = "<p style='color: red;'>Something went wrong! Database isn't loaded!</p>";
    }

    await generatePageAxiliaryContents();

    // Package Search
    document.getElementById("searchPackage").addEventListener("click", search);
    document.getElementById("filter_packages").addEventListener("change", search);
});

function showMsg(message) {
    document.getElementById("log").innerHTML = `<strong>Log:</strong> ${message}`;
}

async function generatePageAxiliaryContents() {
    // it generates filters, region filer etc.

    const filter_packagesElement = document.getElementById("filter_packages");
    // const region_filterElement = document.getElementById("region_filter");

    const database = await fetch_database(); // execute from core/psndl.js
    if (!database) {
        return
    }

    // let gameTypes = [];

    // Hunting for game_type > PS3, DLC etc.
    for (const game_type in database) {
        const newOption = document.createElement("option");
        newOption.value = game_type;
        newOption.textContent = game_type;

        filter_packagesElement.append(newOption);

        // gameTypes.push(game_type);
    }

    // hunting for region > USA, EU etc.
    // for (const index in gameTypes) {
    //     const filtered_type = database[gameTypes[index]];

    //     for (const region in filtered_type) {
    //         const newOption = document.createElement("option");
    //         newOption.value = region;
    //         newOption.textContent = region;

    //         region_filterElement.append(newOption);
    //     }
    // }
}

async function search() {
    const search_keyElement = document.getElementById("search_key");
    const contentArea = document.getElementById("content_area");
    const filter_packagesElement = document.getElementById("filter_packages");

    if (!search_keyElement.value) {
        search_keyElement.focus();
        return
    }

    const data = await searchDB(search_keyElement.value, filter_packagesElement.value); // core/psndl.js
    if (!data) {
        contentArea.innerHTML = "<p>No packages found matching your search.</p>";
        return
    }
    
    let HTMLContent = "";

    for (const game_type in data) {
        HTMLContent += `<h2 style='text-align: center;color:rgb(0, 150, 255);'>${game_type}</h2><hr><br>`

        for (const game_id in data[game_type]) {
            const game = data[game_type][game_id];

            let game_name = game.name; // need this to edit game name if there is no rap data
            let is_game_rap = game.rap_data;

            if (!is_game_rap) {
                game_name += " <span style='color: red;'>(Missing RAP)</span>"
            }

            HTMLContent += `
                <div class="game-item">
                    <h3>${game_name}</h3>
                    <p><b>ID:</b> ${game.id}</p>
                    <p><b>Type:</b> ${game.type}</p>
                    <p><b>Region:</b> ${game.region}</p>
                    <p><b>Rap:</b> ${game.rap_name}</p>
                    <p><b>Author:</b> ${game.author}</p>
                    <p><b>Description:</b> ${game.desc}</p>
                    <a href='${game.link}' target='_blank'><button class='btn'>Download File</button></a>
                    <button class='btn' onclick='downloadRap("${game.rap_name}", "${game.rap_data}")'>Download RAP</button>
                </div>
            `;
        }

        contentArea.innerHTML = HTMLContent;
    }
}
