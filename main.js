// --- GAME STATE VARIABLES ---
let storageCap = 100;
let storageUpgradeCost = 25;

let ironOre = 0; let ironMiners = 0; let ironMinerCost = 10;
let copperOre = 0; let copperMiners = 0; let copperMinerCost = 10;
let coal = 0; let coalMiners = 0; let coalMinerCost = 10;

let ironPlates = 0; let ironSmelters = 0; let smelterCost = 20;

let lastSaveTime = Date.now();

// --- GRAB HTML ELEMENTS ---
const storageCapDisplay1 = document.getElementById("storage-cap-1");
const storageCapDisplay2 = document.getElementById("storage-cap-2");
const upgradeStorageBtn = document.getElementById("upgrade-storage-btn");
const storageUpgradeCostDisplay = document.getElementById("storage-upgrade-cost");

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

const coalCountDisplay = document.getElementById("coal-count");
const coalMinerCountDisplay = document.getElementById("coal-miner-count");
const coalMinerCostDisplay = document.getElementById("coal-miner-cost");
const mineCoalBtn = document.getElementById("mine-coal-btn");
const buyCoalMinerBtn = document.getElementById("buy-coal-miner-btn");

const ironPlateCountDisplay = document.getElementById("iron-plate-count");
const smelterCountDisplay = document.getElementById("smelter-count");
const smelterCostDisplay = document.getElementById("smelter-cost");
const buySmelterBtn = document.getElementById("buy-smelter-btn");

const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");
const timeSinceSaveDisplay = document.getElementById("time-since-save");

const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeModal = document.getElementById("close-modal");

// --- 1. GAMEPLAY BUTTONS ---
mineIronBtn.addEventListener("click", () => { if (ironOre < storageCap) ironOre++; updateUI(); });
mineCopperBtn.addEventListener("click", () => { if (copperOre < storageCap) copperOre++; updateUI(); });
mineCoalBtn.addEventListener("click", () => { if (coal < storageCap) coal++; updateUI(); });

buyIronMinerBtn.addEventListener("click", () => {
    if (ironOre >= ironMinerCost) {
        ironOre -= ironMinerCost;
        ironMiners++;
        ironMinerCost = Math.floor(ironMinerCost * 1.5);
        updateUI();
    }
});

buyCopperMinerBtn.addEventListener("click", () => {
    if (copperOre >= copperMinerCost) {
        copperOre -= copperMinerCost;
        copperMiners++;
        copperMinerCost = Math.floor(copperMinerCost * 1.5);
        updateUI();
    }
});

buyCoalMinerBtn.addEventListener("click", () => {
    if (coal >= coalMinerCost) {
        coal -= coalMinerCost;
        coalMiners++;
        coalMinerCost = Math.floor(coalMinerCost * 1.5);
        updateUI();
    }
});

buySmelterBtn.addEventListener("click", () => {
    if (ironOre >= smelterCost) {
        ironOre -= smelterCost;
        ironSmelters++;
        smelterCost = Math.floor(smelterCost * 1.5);
        updateUI();
    }
});

// Upgrade Storage using Iron Plates
upgradeStorageBtn.addEventListener("click", () => {
    if (ironPlates >= storageUpgradeCost) {
        ironPlates -= storageUpgradeCost;
        storageCap = Math.floor(storageCap * 2); // Doubles storage!
        storageUpgradeCost = Math.floor(storageUpgradeCost * 2.5); // Gets much more expensive
        updateUI();
    }
});

// --- 2. THE AUTOMATION LOOP ---
setInterval(() => {
    // Miners add resources, but cannot exceed storage cap
    if (ironMiners > 0) ironOre = Math.min(ironOre + ironMiners, storageCap);
    if (copperMiners > 0) copperOre = Math.min(copperOre + copperMiners, storageCap);
    if (coalMiners > 0) coal = Math.min(coal + coalMiners, storageCap);

    // Smelters require Iron AND Coal, and cannot exceed Plate storage cap
    if (ironSmelters > 0) {
        let spaceLeftForPlates = storageCap - ironPlates;

        // Find the limiting factor: Smelters, Iron, Coal, or Space
        let amountToSmelt = Math.min(ironOre, coal, ironSmelters, spaceLeftForPlates);

        ironOre -= amountToSmelt;
        coal -= amountToSmelt;
        ironPlates += amountToSmelt;
    }
    updateUI();
}, 1000);

setInterval(() => {
    const seconds = Math.floor((Date.now() - lastSaveTime) / 1000);
    timeSinceSaveDisplay.innerText = `Last saved: ${seconds} seconds ago`;
}, 1000);

// --- 3. UPDATE THE SCREEN ---
function updateUI() {
    storageCapDisplay1.innerText = storageCap;
    storageCapDisplay2.innerText = storageCap;
    storageUpgradeCostDisplay.innerText = storageUpgradeCost;

    ironCountDisplay.innerText = ironOre;
    ironMinerCountDisplay.innerText = ironMiners;
    ironMinerCostDisplay.innerText = ironMinerCost;

    copperCountDisplay.innerText = copperOre;
    copperMinerCountDisplay.innerText = copperMiners;
    copperMinerCostDisplay.innerText = copperMinerCost;

    coalCountDisplay.innerText = coal;
    coalMinerCountDisplay.innerText = coalMiners;
    coalMinerCostDisplay.innerText = coalMinerCost;

    ironPlateCountDisplay.innerText = ironPlates;
    smelterCountDisplay.innerText = ironSmelters;
    smelterCostDisplay.innerText = smelterCost;
}

// --- 4. SAVE & LOAD SYSTEM ---
function saveGame() {
    const gameData = {
        storageCap, storageUpgradeCost,
        ironOre, ironMiners, ironMinerCost,
        copperOre, copperMiners, copperMinerCost,
        coal, coalMiners, coalMinerCost,
        ironPlates, ironSmelters, smelterCost
    };
    localStorage.setItem("factorySave", JSON.stringify(gameData));
    lastSaveTime = Date.now();
    timeSinceSaveDisplay.innerText = `Last saved: Just now`;
}

function loadGame() {
    const savedData = localStorage.getItem("factorySave");
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.storageCap !== undefined) storageCap = data.storageCap;
        if (data.storageUpgradeCost !== undefined) storageUpgradeCost = data.storageUpgradeCost;
        if (data.ironOre !== undefined) ironOre = data.ironOre;
        if (data.ironMiners !== undefined) ironMiners = data.ironMiners;
        if (data.ironMinerCost !== undefined) ironMinerCost = data.ironMinerCost;
        if (data.copperOre !== undefined) copperOre = data.copperOre;
        if (data.copperMiners !== undefined) copperMiners = data.copperMiners;
        if (data.copperMinerCost !== undefined) copperMinerCost = data.copperMinerCost;
        if (data.coal !== undefined) coal = data.coal;
        if (data.coalMiners !== undefined) coalMiners = data.coalMiners;
        if (data.coalMinerCost !== undefined) coalMinerCost = data.coalMinerCost;
        if (data.ironPlates !== undefined) ironPlates = data.ironPlates;
        if (data.ironSmelters !== undefined) ironSmelters = data.ironSmelters;
        if (data.smelterCost !== undefined) smelterCost = data.smelterCost;

        lastSaveTime = Date.now();
        updateUI();
    }
}

setInterval(saveGame, 10000);
saveBtn.addEventListener("click", saveGame);
resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to wipe all progress? This cannot be undone!")) {
        localStorage.removeItem("factorySave");
        location.reload();
    }
});

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

loadGame();

window.addEventListener("beforeunload", (event) => {
    const secondsUnsaved = Math.floor((Date.now() - lastSaveTime) / 1000);
    if (secondsUnsaved > 2) {
        event.preventDefault();
        event.returnValue = "";
    }
});

// --- 5. MODAL & THEME LOGIC ---
settingsBtn.addEventListener("click", () => { settingsModal.style.display = "flex"; });
closeModal.addEventListener("click", () => { settingsModal.style.display = "none"; });
window.addEventListener("click", (event) => {
    if (event.target === settingsModal) settingsModal.style.display = "none";
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