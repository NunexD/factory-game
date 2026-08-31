// --- GAME STATE VARIABLES ---
let storageCap = 100; let storageUpgradeCost = 25;
let ironOre = 0; let ironMiners = 0; let ironMinerCost = 10;
let copperOre = 0; let copperMiners = 0; let copperMinerCost = 10;
let coal = 0; let coalMiners = 0; let coalMinerCost = 10;
let ironPlates = 0; let ironSmelters = 0; let smelterCost = 20;
let copperWire = 0; let wireExtruders = 0; let extruderCost = 25;
let circuitBoards = 0; let assemblers = 0; let assemblerCost = 30;

let steamEngines = 0; let steamEngineCost = 20;
let powerSupply = 0; let powerDemand = 0;
let unlockedSmelting = false; let unlockedElectronics = false;
let upgPickaxe = false; let upgMiners = false; let upgSmelters = false;
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

const copperWireCountDisplay = document.getElementById("copper-wire-count");
const extruderCountDisplay = document.getElementById("extruder-count");
const extruderCostDisplay = document.getElementById("extruder-cost");
const buyExtruderBtn = document.getElementById("buy-extruder-btn");

const circuitBoardCountDisplay = document.getElementById("circuit-board-count");
const assemblerCountDisplay = document.getElementById("assembler-count");
const assemblerCostDisplay = document.getElementById("assembler-cost");
const buyAssemblerBtn = document.getElementById("buy-assembler-btn");

const powerStatusDisplay = document.getElementById("power-status");
const engineCountDisplay = document.getElementById("engine-count");
const engineCostDisplay = document.getElementById("engine-cost");
const buyEngineBtn = document.getElementById("buy-engine-btn");

const unlockSmeltingBtn = document.getElementById("unlock-smelting-btn");
const unlockElectronicsBtn = document.getElementById("unlock-electronics-btn");

const upgPickaxeBtn = document.getElementById("upg-pickaxe-btn");
const upgMinersBtn = document.getElementById("upg-miners-btn");
const upgSmeltersBtn = document.getElementById("upg-smelters-btn");

const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");
const timeSinceSaveDisplay = document.getElementById("time-since-save");
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeModal = document.getElementById("close-modal");

// Animation Progress Bar Elements
const smelterProgress = document.getElementById("smelter-progress");
const extruderProgress = document.getElementById("extruder-progress");
const assemblerProgress = document.getElementById("assembler-progress");

// --- 1. GAMEPLAY BUTTONS ---
mineIronBtn.addEventListener("click", () => { let yield = upgPickaxe ? 3 : 1; ironOre = Math.min(ironOre + yield, storageCap); updateUI(); });
mineCopperBtn.addEventListener("click", () => { let yield = upgPickaxe ? 3 : 1; copperOre = Math.min(copperOre + yield, storageCap); updateUI(); });
mineCoalBtn.addEventListener("click", () => { let yield = upgPickaxe ? 3 : 1; coal = Math.min(coal + yield, storageCap); updateUI(); });

buyIronMinerBtn.addEventListener("click", () => { if (ironOre >= ironMinerCost) { ironOre -= ironMinerCost; ironMiners++; ironMinerCost = Math.floor(ironMinerCost * 1.5); updateUI(); } });
buyCopperMinerBtn.addEventListener("click", () => { if (copperOre >= copperMinerCost) { copperOre -= copperMinerCost; copperMiners++; copperMinerCost = Math.floor(copperMinerCost * 1.5); updateUI(); } });
buyCoalMinerBtn.addEventListener("click", () => { if (coal >= coalMinerCost) { coal -= coalMinerCost; coalMiners++; coalMinerCost = Math.floor(coalMinerCost * 1.5); updateUI(); } });
buySmelterBtn.addEventListener("click", () => { if (ironOre >= smelterCost) { ironOre -= smelterCost; ironSmelters++; smelterCost = Math.floor(smelterCost * 1.5); updateUI(); } });
buyExtruderBtn.addEventListener("click", () => { if (copperOre >= extruderCost) { copperOre -= extruderCost; wireExtruders++; extruderCost = Math.floor(extruderCost * 1.5); updateUI(); } });
buyAssemblerBtn.addEventListener("click", () => { if (ironPlates >= assemblerCost) { ironPlates -= assemblerCost; assemblers++; assemblerCost = Math.floor(assemblerCost * 1.5); updateUI(); } });
buyEngineBtn.addEventListener("click", () => { if (ironPlates >= steamEngineCost) { ironPlates -= steamEngineCost; steamEngines++; steamEngineCost = Math.floor(steamEngineCost * 1.5); updateUI(); } });
upgradeStorageBtn.addEventListener("click", () => { if (ironPlates >= storageUpgradeCost) { ironPlates -= storageUpgradeCost; storageCap = Math.floor(storageCap * 2); storageUpgradeCost = Math.floor(storageUpgradeCost * 2.5); updateUI(); } });

unlockSmeltingBtn.addEventListener("click", () => { if (ironOre >= 50) { ironOre -= 50; unlockedSmelting = true; updateUI(); } });
unlockElectronicsBtn.addEventListener("click", () => { if (ironPlates >= 50) { ironPlates -= 50; unlockedElectronics = true; updateUI(); } });

upgPickaxeBtn.addEventListener("click", () => { if (circuitBoards >= 10 && !upgPickaxe) { circuitBoards -= 10; upgPickaxe = true; updateUI(); } });
upgMinersBtn.addEventListener("click", () => { if (circuitBoards >= 25 && !upgMiners) { circuitBoards -= 25; upgMiners = true; updateUI(); } });
upgSmeltersBtn.addEventListener("click", () => { if (circuitBoards >= 50 && !upgSmelters) { circuitBoards -= 50; upgSmelters = true; updateUI(); } });

// --- 2. THE AUTOMATION LOOP ---
setInterval(() => {
    // Machine active trackers for animations
    let smelterActive = false;
    let extruderActive = false;
    let assemblerActive = false;

    let minerMulti = upgMiners ? 2 : 1;
    if (ironMiners > 0) ironOre = Math.min(ironOre + (ironMiners * minerMulti), storageCap);
    if (copperMiners > 0) copperOre = Math.min(copperOre + (copperMiners * minerMulti), storageCap);
    if (coalMiners > 0) coal = Math.min(coal + (coalMiners * minerMulti), storageCap);

    let activeEngines = Math.min(steamEngines, coal);
    coal -= activeEngines;
    powerSupply = activeEngines * 10;
    powerDemand = (wireExtruders * 2) + (assemblers * 5);

    if (ironSmelters > 0) {
        let spaceLeftForPlates = storageCap - ironPlates;
        let amountToSmelt = 0;

        if (upgSmelters) amountToSmelt = Math.min(ironOre, ironSmelters, spaceLeftForPlates);
        else amountToSmelt = Math.min(ironOre, coal, ironSmelters, spaceLeftForPlates);

        if (amountToSmelt > 0) {
            ironOre -= amountToSmelt;
            if (!upgSmelters) coal -= amountToSmelt;
            ironPlates += amountToSmelt;
            smelterActive = true; // Engine successfully ran!
        }
    }

    if (powerSupply >= powerDemand && powerDemand > 0) {
        if (wireExtruders > 0) {
            let spaceLeftForWire = storageCap - copperWire;
            let amountToExtrude = Math.min(copperOre, wireExtruders, Math.floor(spaceLeftForWire / 2));
            if (amountToExtrude > 0) {
                copperOre -= amountToExtrude; copperWire += (amountToExtrude * 2);
                extruderActive = true; // Extruder successfully ran!
            }
        }
        if (assemblers > 0) {
            let spaceLeftForBoards = storageCap - circuitBoards;
            let maxFromWire = Math.floor(copperWire / 2);
            let amountToAssemble = Math.min(ironPlates, maxFromWire, assemblers, spaceLeftForBoards);
            if (amountToAssemble > 0) {
                ironPlates -= amountToAssemble; copperWire -= (amountToAssemble * 2); circuitBoards += amountToAssemble;
                assemblerActive = true; // Assembler successfully ran!
            }
        }
    }

    // Toggle CSS animations based on activity
    if (smelterActive) smelterProgress.classList.add("running");
    else smelterProgress.classList.remove("running");

    if (extruderActive) extruderProgress.classList.add("running");
    else extruderProgress.classList.remove("running");

    if (assemblerActive) assemblerProgress.classList.add("running");
    else assemblerProgress.classList.remove("running");

    updateUI();
}, 1000);

setInterval(() => {
    timeSinceSaveDisplay.innerText = `Last saved: ${Math.floor((Date.now() - lastSaveTime) / 1000)} seconds ago`;
}, 1000);

// --- 3. UPDATE THE SCREEN ---
function updateUI() {
    storageCapDisplay1.innerText = storageCap; storageCapDisplay2.innerText = storageCap; storageUpgradeCostDisplay.innerText = storageUpgradeCost;
    ironCountDisplay.innerText = ironOre; ironMinerCountDisplay.innerText = ironMiners; ironMinerCostDisplay.innerText = ironMinerCost;
    copperCountDisplay.innerText = copperOre; copperMinerCountDisplay.innerText = copperMiners; copperMinerCostDisplay.innerText = copperMinerCost;
    coalCountDisplay.innerText = coal; coalMinerCountDisplay.innerText = coalMiners; coalMinerCostDisplay.innerText = coalMinerCost;
    ironPlateCountDisplay.innerText = ironPlates; smelterCountDisplay.innerText = ironSmelters; smelterCostDisplay.innerText = smelterCost;
    copperWireCountDisplay.innerText = copperWire; extruderCountDisplay.innerText = wireExtruders; extruderCostDisplay.innerText = extruderCost;
    circuitBoardCountDisplay.innerText = circuitBoards; assemblerCountDisplay.innerText = assemblers; assemblerCostDisplay.innerText = assemblerCost;

    engineCountDisplay.innerText = steamEngines; engineCostDisplay.innerText = steamEngineCost;
    powerStatusDisplay.innerText = `${powerSupply} kW / ${powerDemand} kW`;

    if (powerDemand > powerSupply) powerStatusDisplay.classList.add("power-shortage");
    else powerStatusDisplay.classList.remove("power-shortage");

    if (unlockedSmelting) {
        document.getElementById("coal-inv").classList.remove("hidden"); document.getElementById("plate-inv").classList.remove("hidden");
        document.getElementById("coal-action").classList.remove("hidden"); document.getElementById("smelting-action").classList.remove("hidden");
        unlockSmeltingBtn.classList.add("hidden");
        if (!unlockedElectronics) unlockElectronicsBtn.classList.remove("hidden");
    }
    if (unlockedElectronics) {
        document.getElementById("copper-inv").classList.remove("hidden"); document.getElementById("advanced-inv").classList.remove("hidden");
        document.getElementById("copper-action").classList.remove("hidden"); document.getElementById("advanced-action").classList.remove("hidden");
        document.getElementById("power-grid").classList.remove("hidden"); document.getElementById("upgrades-action").classList.remove("hidden");
        unlockElectronicsBtn.classList.add("hidden");
    }
    if (unlockedSmelting && unlockedElectronics) document.getElementById("research-section").classList.add("hidden");

    if (upgPickaxe) { upgPickaxeBtn.classList.add("purchased"); upgPickaxeBtn.innerText = "🛠️ Steel Pickaxe (Purchased)"; }
    if (upgMiners) { upgMinersBtn.classList.add("purchased"); upgMinersBtn.innerText = "⚡ Overclock Miners (Purchased)"; }
    if (upgSmelters) { upgSmeltersBtn.classList.add("purchased"); upgSmeltersBtn.innerText = "🔥 Carbon Smelting (Purchased)"; }
}

// --- 4. SAVE & LOAD SYSTEM ---
function saveGame() {
    const gameData = {
        storageCap, storageUpgradeCost, ironOre, ironMiners, ironMinerCost, copperOre, copperMiners, copperMinerCost, coal, coalMiners, coalMinerCost,
        ironPlates, ironSmelters, smelterCost, copperWire, wireExtruders, extruderCost, circuitBoards, assemblers, assemblerCost, steamEngines, steamEngineCost,
        unlockedSmelting, unlockedElectronics, upgPickaxe, upgMiners, upgSmelters
    };
    localStorage.setItem("factorySave", JSON.stringify(gameData));
    lastSaveTime = Date.now(); timeSinceSaveDisplay.innerText = `Last saved: Just now`;
}

function loadGame() {
    const savedData = localStorage.getItem("factorySave");
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.storageCap !== undefined) storageCap = data.storageCap; if (data.storageUpgradeCost !== undefined) storageUpgradeCost = data.storageUpgradeCost;
        if (data.ironOre !== undefined) ironOre = data.ironOre; if (data.ironMiners !== undefined) ironMiners = data.ironMiners; if (data.ironMinerCost !== undefined) ironMinerCost = data.ironMinerCost;
        if (data.copperOre !== undefined) copperOre = data.copperOre; if (data.copperMiners !== undefined) copperMiners = data.copperMiners; if (data.copperMinerCost !== undefined) copperMinerCost = data.copperMinerCost;
        if (data.coal !== undefined) coal = data.coal; if (data.coalMiners !== undefined) coalMiners = data.coalMiners; if (data.coalMinerCost !== undefined) coalMinerCost = data.coalMinerCost;
        if (data.ironPlates !== undefined) ironPlates = data.ironPlates; if (data.ironSmelters !== undefined) ironSmelters = data.ironSmelters; if (data.smelterCost !== undefined) smelterCost = data.smelterCost;
        if (data.copperWire !== undefined) copperWire = data.copperWire; if (data.wireExtruders !== undefined) wireExtruders = data.wireExtruders; if (data.extruderCost !== undefined) extruderCost = data.extruderCost;
        if (data.circuitBoards !== undefined) circuitBoards = data.circuitBoards; if (data.assemblers !== undefined) assemblers = data.assemblers; if (data.assemblerCost !== undefined) assemblerCost = data.assemblerCost;
        if (data.steamEngines !== undefined) steamEngines = data.steamEngines; if (data.steamEngineCost !== undefined) steamEngineCost = data.steamEngineCost;
        if (data.unlockedSmelting !== undefined) unlockedSmelting = data.unlockedSmelting; if (data.unlockedElectronics !== undefined) unlockedElectronics = data.unlockedElectronics;
        if (data.upgPickaxe !== undefined) upgPickaxe = data.upgPickaxe; if (data.upgMiners !== undefined) upgMiners = data.upgMiners; if (data.upgSmelters !== undefined) upgSmelters = data.upgSmelters;

        lastSaveTime = Date.now(); updateUI();
    }
}

setInterval(saveGame, 10000); saveBtn.addEventListener("click", saveGame);
resetBtn.addEventListener("click", () => { if (confirm("Are you sure you want to wipe all progress? This cannot be undone!")) { localStorage.removeItem("factorySave"); location.reload(); } });
exportBtn.addEventListener("click", () => { saveGame(); const b = new Blob([localStorage.getItem("factorySave")], { type: "application/json" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "factory-save.json"; a.click(); URL.revokeObjectURL(u); });
importFile.addEventListener("change", (e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = function(ev) { try { localStorage.setItem("factorySave", JSON.stringify(JSON.parse(ev.target.result))); alert("Save imported!"); location.reload(); } catch (err) { alert("Invalid save file!"); } }; r.readAsText(f); } });
loadGame();
window.addEventListener("beforeunload", (e) => { if (Math.floor((Date.now() - lastSaveTime) / 1000) > 2) { e.preventDefault(); e.returnValue = ""; } });

settingsBtn.addEventListener("click", () => { settingsModal.style.display = "flex"; });
closeModal.addEventListener("click", () => { settingsModal.style.display = "none"; });
window.addEventListener("click", (e) => { if (e.target === settingsModal) settingsModal.style.display = "none"; });

const themeToggleBtn = document.getElementById("theme-toggle"); const body = document.body;
if (localStorage.getItem("theme") === "dark") { body.classList.add("dark-mode"); themeToggleBtn.innerText = "☀️ Light Mode"; }
themeToggleBtn.addEventListener("click", () => { body.classList.toggle("dark-mode"); if (body.classList.contains("dark-mode")) { themeToggleBtn.innerText = "☀️ Light Mode"; localStorage.setItem("theme", "dark"); } else { themeToggleBtn.innerText = "🌙 Dark Mode"; localStorage.setItem("theme", "light"); } });