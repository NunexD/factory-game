// --- GAME STATE VARIABLES ---
let ironOre = 0;
let ironMiners = 0;
let ironMinerCost = 10;

let copperOre = 0;
let copperMiners = 0;
let copperMinerCost = 10;

let ironPlates = 0;
let ironSmelters = 0;
let smelterCost = 20;

// --- GRAB HTML ELEMENTS ---
const ironCountDisplay = document.getElementById("iron-count");
const ironMinerCountDisplay = document.getElementById("miner-count");
const ironMinerCostDisplay = document.getElementById("miner-cost");
const mineIronBtn = document.getElementById("mine-iron-btn");
const buyIronMinerBtn = document.getElementById("buy-miner-btn");

const copperCountDisplay = document.getElementById("copper-count");
const copperMinerCountDisplay = document.getElementById("copper-miner-count");
const copperMinerCostDisplay = document.getElementById("copper-miner-cost");
const mineCopperBtn = document.getElementById("mine-copper-btn");
const buyCopperMinerBtn = document.getElementById("buy-copper-miner-btn");

const ironPlateCountDisplay = document.getElementById("iron-plate-count");
const smelterCountDisplay = document.getElementById("smelter-count");
const smelterCostDisplay = document.getElementById("smelter-cost");
const buySmelterBtn = document.getElementById("buy-smelter-btn");

// New System Elements
const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");

// --- 1. GAMEPLAY BUTTONS ---
mineIronBtn.addEventListener("click", () => {
    ironOre += 1;
    updateUI();
});

mineCopperBtn.addEventListener("click", () => {
    copperOre += 1;
    updateUI();
});

buyIronMinerBtn.addEventListener("click", () => {
    if (ironOre >= ironMinerCost) {
        ironOre -= ironMinerCost;
        ironMiners += 1;
        ironMinerCost = Math.floor(ironMinerCost * 1.5);
        updateUI();
    }
});

buyCopperMinerBtn.addEventListener("click", () => {
    if (copperOre >= copperMinerCost) {
        copperOre -= copperMinerCost;
        copperMiners += 1;
        copperMinerCost = Math.floor(copperMinerCost * 1.5);
        updateUI();
    }
});

buySmelterBtn.addEventListener("click", () => {
    if (ironOre >= smelterCost) {
        ironOre -= smelterCost;
        ironSmelters += 1;
        smelterCost = Math.floor(smelterCost * 1.5);
        updateUI();
    }
});

// --- 2. THE AUTOMATION LOOP ---
setInterval(() => {
    if (ironMiners > 0) ironOre += ironMiners;
    if (copperMiners > 0) copperOre += copperMiners;

    if (ironSmelters > 0) {
        let amountToSmelt = Math.min(ironOre, ironSmelters);
        ironOre -= amountToSmelt;
        ironPlates += amountToSmelt;
    }
    updateUI();
}, 1000);

// --- 3. UPDATE THE SCREEN ---
function updateUI() {
    ironCountDisplay.innerText = ironOre;
    ironMinerCountDisplay.innerText = ironMiners;
    ironMinerCostDisplay.innerText = ironMinerCost;

    copperCountDisplay.innerText = copperOre;
    copperMinerCountDisplay.innerText = copperMiners;
    copperMinerCostDisplay.innerText = copperMinerCost;

    ironPlateCountDisplay.innerText = ironPlates;
    smelterCountDisplay.innerText = ironSmelters;
    smelterCostDisplay.innerText = smelterCost;
}

// --- 4. SAVE & LOAD SYSTEM ---

// Bundle all data and save to browser memory
function saveGame() {
    const gameData = {
        ironOre, ironMiners, ironMinerCost,
        copperOre, copperMiners, copperMinerCost,
        ironPlates, ironSmelters, smelterCost
    };
    localStorage.setItem("factorySave", JSON.stringify(gameData));
    console.log("Game Saved!");
}

// Read data from browser memory and overwrite variables
function loadGame() {
    const savedData = localStorage.getItem("factorySave");
    if (savedData) {
        const data = JSON.parse(savedData);
        // We check if data exists before loading it, to prevent bugs
        if (data.ironOre !== undefined) ironOre = data.ironOre;
        if (data.ironMiners !== undefined) ironMiners = data.ironMiners;
        if (data.ironMinerCost !== undefined) ironMinerCost = data.ironMinerCost;
        if (data.copperOre !== undefined) copperOre = data.copperOre;
        if (data.copperMiners !== undefined) copperMiners = data.copperMiners;
        if (data.copperMinerCost !== undefined) copperMinerCost = data.copperMinerCost;
        if (data.ironPlates !== undefined) ironPlates = data.ironPlates;
        if (data.ironSmelters !== undefined) ironSmelters = data.ironSmelters;
        if (data.smelterCost !== undefined) smelterCost = data.smelterCost;
        updateUI();
    }
}

// Auto-Save every 10 seconds (10000 ms)
setInterval(saveGame, 10000);

// Manual Save Button
saveBtn.addEventListener("click", () => {
    saveGame();
    alert("Game manually saved!");
});

// Hard Reset Button
resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to wipe all progress? This cannot be undone!")) {
        localStorage.removeItem("factorySave");
        location.reload(); // Refreshes the page to start fresh
    }
});

// --- 5. EXPORT / IMPORT TO FILE ---

// Export to .json file
exportBtn.addEventListener("click", () => {
    saveGame(); // Save latest data first
    const savedData = localStorage.getItem("factorySave");

    // Create a temporary text file in the browser
    const blob = new Blob([savedData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a fake link, click it to download, then delete the link
    const a = document.createElement("a");
    a.href = url;
    a.download = "factory-save.json";
    a.click();
    URL.revokeObjectURL(url);
});

// Import from .json file
importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Parse the text file and save it to browser memory
                const importedData = JSON.parse(e.target.result);
                localStorage.setItem("factorySave", JSON.stringify(importedData));
                alert("Save imported successfully! Reloading game...");
                location.reload(); // Reload to apply the loaded data
            } catch (err) {
                alert("Invalid save file!");
            }
        };
        reader.readAsText(file);
    }
});

// Load the game immediately when the script first runs
loadGame();

// --- 6. THEME TOGGLE LOGIC ---
const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    themeToggleBtn.innerText = "☀️ Light Mode";
}

themeToggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
        themeToggleBtn.innerText = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggleBtn.innerText = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
    }
});