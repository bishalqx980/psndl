function showMsg(message) {
    document.getElementById("log").textContent = message;
}

function load() {
    const from_yearElement = document.getElementById("from_year");
    const current_yearElement = document.getElementById("current_year");

    const date = new Date();
    // Exception
    if (date.getFullYear() == "2025") {
        from_yearElement.textContent = "";
    }

    current_yearElement.textContent = date.getFullYear();
    generatePageAxiliaryContents();
    renderDatabaseContents();
}

async function renderDatabaseContents() {
    // this will load all content in database
    const startTime = performance.now();

    const contentArea = document.getElementById("content_area");

    const database = await fetch_database();
    if (!database) {
        contentArea.innerHTML = "<p>Something went wrong! Database isn't loaded!</p>";
        return
    }
    
    let HTMLContent = "";
    let loadedPackageCount = 0;
    let maxLoadPackage = 10;

    let loadHTMLContent = false;
    if (!loadHTMLContent) {
        HTMLContent += "<p>Search for package</p>";
    }

    for (const packageType in database) {
        if (loadHTMLContent && loadedPackageCount < maxLoadPackage) {
            HTMLContent += `<h2 style='text-align: center;'>${packageType}</h2><hr>`;
        }

        for (const packageRegion in database[packageType]) {
            for (const packageID in database[packageType][packageRegion]) {
                const packageData = database[packageType][packageRegion][packageID];

                loadedPackageCount += 1;
                showMsg("Package loaded: " + loadedPackageCount);

                if (loadHTMLContent && loadedPackageCount < maxLoadPackage) {
                    HTMLContent += `
                        <div class="game-item">
                            <h3>${packageData.name}</h3>
                            <p><b>ID:</b> ${packageData.id}</p>
                            <p><b>Type:</b> ${packageData.type}</p>
                            <p><b>Region:</b> ${packageData.region}</p>
                            <p><b>Rap:</b> ${packageData.rap_name}</p>
                            <p><b>Author:</b> ${packageData.author}</p>
                            <p><b>Description:</b> ${packageData.desc}</p>
                            <a href='${packageData.link}'><button class='btn'>Download File</button></a>
                            <button class='btn' onclick='downloadRap("${packageData.rap_name}", "${packageData.rap_data}")'>Download RAP</button>
                        </div>
                    `;
                }
            }
        }

        contentArea.innerHTML = HTMLContent;
    }

    const endTime = performance.now();
    showMsg("Total package loaded: " + loadedPackageCount + " in " + ((endTime - startTime) / 1000).toFixed(2) + "sec");
}

async function generatePageAxiliaryContents() {
    // it generates filters, region filer etc.

    const filter_packagesElement = document.getElementById("filter_packages");
    // const region_filterElement = document.getElementById("region_filter");

    const database = await fetch_database(); // core/psndl.js
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
        HTMLContent += `<h2>${game_type}</h2><hr><br>`

        for (const game_id in data[game_type]) {
            const game = data[game_type][game_id];

            HTMLContent += `
                <div class="game-item">
                    <h3>${game.name}</h3>
                    <p><b>ID:</b> ${game.id}</p>
                    <p><b>Type:</b> ${game.type}</p>
                    <p><b>Region:</b> ${game.region}</p>
                    <p><b>Rap:</b> ${game.rap_name}</p>
                    <p><b>Author:</b> ${game.author}</p>
                    <p><b>Description:</b> ${game.desc}</p>
                    <a href='${game.link}'><button class='btn'>Download File</button></a>
                    <button class='btn' onclick='downloadRap("${game.rap_name}", "${game.rap_data}")'>Download RAP</button>
                </div>
            `;
        }

        contentArea.innerHTML = HTMLContent;
    }
}
