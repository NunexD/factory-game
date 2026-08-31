// --- GAME STATE VARIABLES ---
let ironOre = 0; let ironMiners = 0; let ironMinerCost = 10;
let copperOre = 0; let copperMiners = 0; let copperMinerCost = 10;
let ironPlates = 0; let ironSmelters = 0; let smelterCost = 20;

// Save tracking variable
let lastSaveTime = Date.now();

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

// System Elements
const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");
const timeSinceSaveDisplay = document.getElementById("time-since-save");

// Modal Elements
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeModal = document.getElementById("close-modal");

// --- 1. GAMEPLAY BUTTONS ---
mineIronBtn.addEventListener("click", () => { ironOre += 1; updateUI(); });
mineCopperBtn.addEventListener("click", () => { copperOre += 1; updateUI(); });

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

// Update "Time since last save" text in the modal every second
setInterval(() => {
    const seconds = Math.floor((Date.now() - lastSaveTime) / 1000);
    timeSinceSaveDisplay.innerText = `Last saved: ${seconds} seconds ago`;
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
function saveGame() {
    const gameData = {
        ironOre, ironMiners, ironMinerCost,
        copperOre, copperMiners, copperMinerCost,
        ironPlates, ironSmelters, smelterCost
    };
    localStorage.setItem("factorySave", JSON.stringify(gameData));

    // Reset the timer whenever a save happens!
    lastSaveTime = Date.now();
    timeSinceSaveDisplay.innerText = `Last saved: Just now`;
}

function loadGame() {
    const savedData = localStorage.getItem("factorySave");
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.ironOre !== undefined) ironOre = data.ironOre;
        if (data.ironMiners !== undefined) ironMiners = data.ironMiners;
        if (data.ironMinerCost !== undefined) ironMinerCost = data.ironMinerCost;
        if (data.copperOre !== undefined) copperOre = data.copperOre;
        if (data.copperMiners !== undefined) copperMiners = data.copperMiners;
        if (data.copperMinerCost !== undefined) copperMinerCost = data.copperMinerCost;
        if (data.ironPlates !== undefined) ironPlates = data.ironPlates;
        if (data.ironSmelters !== undefined) ironSmelters = data.ironSmelters;
        if (data.smelterCost !== undefined) smelterCost = data.smelterCost;

        lastSaveTime = Date.now(); // Reset timer on load so it doesn't warn instantly
        updateUI();
    }
}

// Auto-Save every 10 seconds
setInterval(saveGame, 10000);

// Manual Save Button
saveBtn.addEventListener("click", saveGame);

// Hard Reset Button
resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to wipe all progress? This cannot be undone!")) {
        localStorage.removeItem("factorySave");
        location.reload();
    }
});

// Export & Import
exportBtn.addEventListener("click", () => {
    saveGame();
    const savedData = localStorage.getItem("factorySave");
    const blob = new Blob([savedData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "factory-save.json";
    a.click();
    URL.revokeObjectURL(url);
});

importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                localStorage.setItem("factorySave", JSON.stringify(importedData));
                alert("Save imported successfully! Reloading game...");
                location.reload();
            } catch (err) {
                alert("Invalid save file!");
            }
        };
        reader.readAsText(file);
    }
});

// Load the game immediately
loadGame();

// --- 5. TAB CLOSE WARNING ---
window.addEventListener("beforeunload", (event) => {
    const secondsUnsaved = Math.floor((Date.now() - lastSaveTime) / 1000);

    // If it has been more than 2 seconds since the last save, trigger the warning
    if (secondsUnsaved > 2) {
        event.preventDefault();
        event.returnValue = ""; // This triggers the browser's default warning popup
    }
});

// --- 6. MODAL & THEME LOGIC ---

// Open Modal
settingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "flex"; // Changes from 'none' to 'flex' to show it
});

// Close Modal (clicking the X)
closeModal.addEventListener("click", () => {
    settingsModal.style.display = "none";
});

// Close Modal (clicking the dark background outside the box)
window.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = "none";
    }
});

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