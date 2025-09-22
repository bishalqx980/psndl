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
    const databaseLoadingDiv = document.getElementById("databaseLoadingDiv");
    const databaseLoadingMessage = document.getElementById("databaseLoadingMessage");
    const mainDiv = document.getElementById("mainDiv");
    const startTime = performance.now();
    const contentArea = document.getElementById("content_area");
    let loadedPackageCount = 0;

    databaseLoadingMessage.innerText = "Loading Database... Please wait!";
    // If database loading takes more time then 5 sec
    setTimeout(() => {
        databaseLoadingMessage.innerHTML += "<br>This is taking a bit longer than usual. Please wait, check your internet connection, or try reloading the page.";
    }, 5000) // 5 Sec

    const database = await fetch_database();
    if (database) {
        // Hide loading database div & Show main section
        databaseLoadingDiv.style.display = "none";
        mainDiv.style.display = "";

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
        showMsg("Total package's loaded " + loadedPackageCount + " in " + ((endTime - startTime) / 1000).toFixed(2) + "sec");
        contentArea.innerHTML = "<p>Search for packages...</p>";
    } else {
        showMsg("<h2 style='color: red;'>Something went wrong! Database isn't loaded!</h2>");
        contentArea.innerHTML = "<p style='color: red;'>Something went wrong! Database isn't loaded!</p>";
    }

    await generatePageAxiliaryContents();

    // Package Search
    document.getElementById("searchPackage").addEventListener("click", () => search());
    document.getElementById("filter_packages").addEventListener("change", () => search());

    // Note toggle button
    document.getElementById("toggleNote").addEventListener("click", function() {
        const notes = document.getElementById("notes");
        const GenerateRapDiv = document.getElementById("GenerateRapDiv");

        // ALways Hide Generate RAP Div
        GenerateRapDiv.style.display = "none";

        if (notes.style.display === "none" || notes.style.display === "") {
            notes.style.display = "block";
        } else {
            notes.style.display = "none";
        }
    });

    // Generate RAP toggle button
    document.getElementById("toggleGenRAP").addEventListener("click", function() {
        const notes = document.getElementById("notes");
        const GenerateRapDiv = document.getElementById("GenerateRapDiv");

        // ALways Hide Notes Div
        notes.style.display = "none";

        if (GenerateRapDiv.style.display === "none" || GenerateRapDiv.style.display === "") {
            GenerateRapDiv.style.display = "block";
        } else {
            GenerateRapDiv.style.display = "none";
        }
    });

    // Loading Package/Content based on URL params
    const params = new URLSearchParams(window.location.search);
    let name = params.get("name");
    let type = params.get("type");

    if (type) {
        type = type.toUpperCase();
    } else {
        type = "null";
    }

    if (name) {
        await search(name, type);
    }
});

function showMsg(message) {
    document.getElementById("log").innerHTML = `<b>Log:</b> ${message}`;
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

function missingRapAlert() {
    return alert("This package is either missing RAP (license) data or does not require a RAP file.");
}

async function search(search_key = null, filter_packages = null) {
    // Note: Search Button is efficient bcz URL param causes window reload which trigger database load again n again!!
    const search_keyElement = document.getElementById("search_key");
    const contentArea = document.getElementById("content_area");
    const filter_packagesElement = document.getElementById("filter_packages");

    const content_name = search_key ?? search_keyElement.value;
    const content_type = filter_packages ?? filter_packagesElement.value;

    // If not any name then this
    if (!content_name) {
        return search_keyElement.focus();
    }

    // Filling gaps with searched values (mostly for URL param)
    search_keyElement.value = content_name;
    filter_packagesElement.value = content_type;
    // Replacing URL with new searched name & type
    const windowURL = new URL(window.location);

    windowURL.searchParams.set("name", content_name);
    windowURL.searchParams.set("type", content_type);
    history.replaceState(null, '', windowURL);

    showMsg("Searching...");

    const data = await searchDB(content_name, content_type); // core/psndl.js
    if (!data) {
        var error_message = "No packages found matching your search.";
        showMsg(error_message);
        return contentArea.innerHTML = error_message;
    }

    showMsg("Loading...");
    
    let HTMLContent = "";
    let package_count = 0;

    for (const game_type in data) {
        HTMLContent += `<h2 style='text-align: center;color:rgb(0, 150, 255);'>${game_type}</h2><hr><br>`

        for (const game_id in data[game_type]) {
            const game = data[game_type][game_id];
            
            let is_game_rap = game.rap_data;

            if (!is_game_rap) {
                rap_dlbtn = `<button class='btn' style='background-color: var(--danger);' onclick='missingRapAlert()'>Missing RAP</button>`;
            } else {
                rap_dlbtn = `<button class='btn' onclick='downloadRap("${game.rap_name}", "${game.rap_data}")'>Download RAP</button>`;
            }

            // here the package_count need +1 bcz the package_count starts with 0
            HTMLContent += `
                <div class="game-item">
                    <h3>${package_count + 1}. ${game.name}</h3>
                    <p><b>ID:</b> ${game.id}</p>
                    <p><b>Type:</b> ${game.type}</p>
                    <p><b>Region:</b> ${game.region}</p>
                    <p><b>Rap:</b> ${game.rap_name}</p>
                    <p><b>Author:</b> ${game.author}</p>
                    <p><b>Description:</b> ${game.desc}</p>
                    <br>
                    <a href='${game.link}' target='_blank'><button class='btn'>Download File</button></a>
                    ${rap_dlbtn}
                </div>
            `;
            
            package_count += 1;
        }

        contentArea.innerHTML = HTMLContent;
        showMsg(`${package_count} Package's found! Check below...`);
    }
}
