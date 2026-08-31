// --- 1. CORE THEME & SYSTEM SETUP (Runs First Guaranteed) ---
const body = document.body;
const themeToggleBtn = document.getElementById("theme-toggle");

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
    renderCanvas(); // Redraw grid with dark mode lines
});

// Modal Logic
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeModal = document.getElementById("close-modal");
settingsBtn.addEventListener("click", () => { settingsModal.style.display = "flex"; });
closeModal.addEventListener("click", () => { settingsModal.style.display = "none"; });
window.addEventListener("click", (e) => { if (e.target === settingsModal) settingsModal.style.display = "none"; });

// --- 2. GAME STATE VARIABLES ---
let storageCap = 100;
let storageUpgradeCost = 25;
let ironOre = 0; let copperOre = 0; let coal = 0;
let ironPlates = 0; let copperWire = 0; let circuitBoards = 0;

let ironMinerCost = 10; let copperMinerCost = 10; let coalMinerCost = 10;
let smelterCost = 20; let extruderCost = 25; let assemblerCost = 30; let steamEngineCost = 20;

// Unplaced Inventory
let unplacedIron = 0; let unplacedCopper = 0; let unplacedCoal = 0;
let unplacedSmelters = 0; let unplacedEngines = 0; let unplacedExtruders = 0; let unplacedAssemblers = 0;

let powerSupply = 0; let powerDemand = 0;
let unlockedSmelting = false; let unlockedElectronics = false;
let upgPickaxe = false; let upgMiners = false; let upgSmelters = false;

let canvasSize = 480;
let landCost = 50;
let lastSaveTime = Date.now();

// --- 3. 2D CANVAS GRAPHICS & COLLISION ENGINE ---
const canvas = document.getElementById("factory-floor");
const ctx = canvas.getContext("2d");
const tileSize = 40;

let placedMachines = [];
let currentBuildMode = "pickup"; // Default mode
let hoverGridX = -1;
let hoverGridY = -1;

// Multi-block machine dimension rules
const machineStats = {
    ironMiner:   { w: 1, h: 1, color: "#78909C", name: "Iron Miner" },
    copperMiner: { w: 1, h: 1, color: "#D87D4A", name: "Copper Miner" },
    coalMiner:   { w: 1, h: 1, color: "#37474F", name: "Coal Miner" },
    smelter:     { w: 2, h: 3, color: "#E64A19", name: "Smelter (2x3)" },      // 6 Blocks!
    engine:      { w: 2, h: 2, color: "#C2185B", name: "Steam Engine (2x2)" }, // 4 Blocks
    extruder:    { w: 2, h: 2, color: "#00ACC1", name: "Extruder (2x2)" },     // 4 Blocks
    assembler:   { w: 3, h: 3, color: "#7B1FA2", name: "Assembler (3x3)" }     // 9 Blocks!
};

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = body.classList.contains("dark-mode");
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += tileSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += tileSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
}

function checkCollision(gridX, gridY, w, h) {
    const maxCols = canvas.width / tileSize;
    const maxRows = canvas.height / tileSize;

    // Bounds check
    if (gridX < 0 || gridY < 0 || gridX + w > maxCols || gridY + h > maxRows) {
        return true;
    }

    // Check overlap with every placed machine
    for (let m of placedMachines) {
        let stat = machineStats[m.type];
        if (gridX < m.x + stat.w && gridX + w > m.x && gridY < m.y + stat.h && gridY + h > m.y) {
            return true;
        }
    }
    return false;
}

function drawMachines() {
    // 1. Draw Placed Machines
    placedMachines.forEach(m => {
        let stat = machineStats[m.type];
        let px = m.x * tileSize;
        let py = m.y * tileSize;
        let pw = stat.w * tileSize;
        let ph = stat.h * tileSize;

        ctx.fillStyle = stat.color;
        ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4);

        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 2, pw - 4, ph - 4);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px Arial";
        ctx.fillText(stat.name, px + 6, py + 18);
    });

    // 2. Draw Hover Ghost (When a machine tool is selected)
    if (currentBuildMode !== "pickup" && hoverGridX >= 0 && hoverGridY >= 0) {
        let stat = machineStats[currentBuildMode];
        if (stat) {
            let collides = checkCollision(hoverGridX, hoverGridY, stat.w, stat.h);
            ctx.fillStyle = collides ? "rgba(229, 57, 53, 0.55)" : "rgba(67, 160, 71, 0.55)";
            ctx.strokeStyle = collides ? "#b71c1c" : "#1b5e20";
            ctx.lineWidth = 2;

            let gx = hoverGridX * tileSize;
            let gy = hoverGridY * tileSize;
            let gw = stat.w * tileSize;
            let gh = stat.h * tileSize;

            ctx.fillRect(gx, gy, gw, gh);
            ctx.strokeRect(gx, gy, gw, gh);
        }
    }
}

function renderCanvas() {
    drawGrid();
    drawMachines();
}

// Mouse tracking
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    hoverGridX = Math.floor((event.clientX - rect.left) / tileSize);
    hoverGridY = Math.floor((event.clientY - rect.top) / tileSize);
    renderCanvas();
});

canvas.addEventListener("mouseleave", () => {
    hoverGridX = -1;
    hoverGridY = -1;
    renderCanvas();
});

// Canvas Click: Place or Pick Up
canvas.addEventListener("click", () => {
    if (hoverGridX < 0 || hoverGridY < 0) return;

    if (currentBuildMode === "pickup") {
        for (let i = 0; i < placedMachines.length; i++) {
            let m = placedMachines[i];
            let stat = machineStats[m.type];
            if (hoverGridX >= m.x && hoverGridX < m.x + stat.w && hoverGridY >= m.y && hoverGridY < m.y + stat.h) {
                // Return to unplaced count
                if (m.type === "ironMiner") unplacedIron++;
                if (m.type === "copperMiner") unplacedCopper++;
                if (m.type === "coalMiner") unplacedCoal++;
                if (m.type === "smelter") unplacedSmelters++;
                if (m.type === "engine") unplacedEngines++;
                if (m.type === "extruder") unplacedExtruders++;
                if (m.type === "assembler") unplacedAssemblers++;

                placedMachines.splice(i, 1);
                updateUI();
                renderCanvas();
                return;
            }
        }
    } else {
        let stat = machineStats[currentBuildMode];
        if (!stat) return;

        if (!checkCollision(hoverGridX, hoverGridY, stat.w, stat.h)) {
            let canPlace = false;
            if (currentBuildMode === "ironMiner" && unplacedIron > 0) { unplacedIron--; canPlace = true; }
            if (currentBuildMode === "copperMiner" && unplacedCopper > 0) { unplacedCopper--; canPlace = true; }
            if (currentBuildMode === "coalMiner" && unplacedCoal > 0) { unplacedCoal--; canPlace = true; }
            if (currentBuildMode === "smelter" && unplacedSmelters > 0) { unplacedSmelters--; canPlace = true; }
            if (currentBuildMode === "engine" && unplacedEngines > 0) { unplacedEngines--; canPlace = true; }
            if (currentBuildMode === "extruder" && unplacedExtruders > 0) { unplacedExtruders--; canPlace = true; }
            if (currentBuildMode === "assembler" && unplacedAssemblers > 0) { unplacedAssemblers--; canPlace = true; }

            if (canPlace) {
                placedMachines.push({ type: currentBuildMode, x: hoverGridX, y: hoverGridY });
                updateUI();
                renderCanvas();
            }
        }
    }
});

// --- 4. BUILD MODE TOOL SWITCHING ---
function setTool(mode, btnId) {
    currentBuildMode = mode;
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    const activeBtn = document.getElementById(btnId);
    if (activeBtn) activeBtn.classList.add("active");

    const titleMap = {
        pickup: "🖐️ Pick Up Tool",
        ironMiner: "Iron Miner [1x1]",
        copperMiner: "Copper Miner [1x1]",
        coalMiner: "Coal Miner [1x1]",
        smelter: "Smelter [2x3]",
        engine: "Steam Engine [2x2]",
        extruder: "Extruder [2x2]",
        assembler: "Assembler [3x3]"
    };
    document.getElementById("current-mode-display").innerText = titleMap[mode] || "Select a Tool";
    renderCanvas();
}

document.getElementById("mode-pickup").addEventListener("click", () => setTool("pickup", "mode-pickup"));
document.getElementById("place-iron-miner").addEventListener("click", () => setTool("ironMiner", "place-iron-miner"));
document.getElementById("place-copper-miner").addEventListener("click", () => setTool("copperMiner", "place-copper-miner"));
document.getElementById("place-coal-miner").addEventListener("click", () => setTool("coalMiner", "place-coal-miner"));
document.getElementById("place-smelter").addEventListener("click", () => setTool("smelter", "place-smelter"));
document.getElementById("place-engine").addEventListener("click", () => setTool("engine", "place-engine"));
document.getElementById("place-extruder").addEventListener("click", () => setTool("extruder", "place-extruder"));
document.getElementById("place-assembler").addEventListener("click", () => setTool("assembler", "place-assembler"));

// --- 5. SHOP & GAMEPLAY BUTTONS ---
document.getElementById("mine-iron-btn").addEventListener("click", () => { let y = upgPickaxe ? 3 : 1; ironOre = Math.min(ironOre + y, storageCap); updateUI(); });
document.getElementById("mine-copper-btn").addEventListener("click", () => { let y = upgPickaxe ? 3 : 1; copperOre = Math.min(copperOre + y, storageCap); updateUI(); });
document.getElementById("mine-coal-btn").addEventListener("click", () => { let y = upgPickaxe ? 3 : 1; coal = Math.min(coal + y, storageCap); updateUI(); });

document.getElementById("buy-miner-btn").addEventListener("click", () => {
    if (ironOre >= ironMinerCost) { ironOre -= ironMinerCost; unplacedIron++; ironMinerCost = Math.floor(ironMinerCost * 1.5); updateUI(); }
});
document.getElementById("buy-copper-miner-btn").addEventListener("click", () => {
    if (copperOre >= copperMinerCost) { copperOre -= copperMinerCost; unplacedCopper++; copperMinerCost = Math.floor(copperMinerCost * 1.5); updateUI(); }
});
document.getElementById("buy-coal-miner-btn").addEventListener("click", () => {
    if (coal >= coalMinerCost) { coal -= coalMinerCost; unplacedCoal++; coalMinerCost = Math.floor(coalMinerCost * 1.5); updateUI(); }
});
document.getElementById("buy-smelter-btn").addEventListener("click", () => {
    if (ironOre >= smelterCost) { ironOre -= smelterCost; unplacedSmelters++; smelterCost = Math.floor(smelterCost * 1.5); updateUI(); }
});
document.getElementById("buy-engine-btn").addEventListener("click", () => {
    if (ironPlates >= steamEngineCost) { ironPlates -= steamEngineCost; unplacedEngines++; steamEngineCost = Math.floor(steamEngineCost * 1.5); updateUI(); }
});
document.getElementById("buy-extruder-btn").addEventListener("click", () => {
    if (copperOre >= extruderCost) { copperOre -= extruderCost; unplacedExtruders++; extruderCost = Math.floor(extruderCost * 1.5); updateUI(); }
});
document.getElementById("buy-assembler-btn").addEventListener("click", () => {
    if (ironPlates >= assemblerCost) { ironPlates -= assemblerCost; unplacedAssemblers++; assemblerCost = Math.floor(assemblerCost * 1.5); updateUI(); }
});

// Storage Upgrade
document.getElementById("upgrade-storage-btn").addEventListener("click", () => {
    if (ironPlates >= storageUpgradeCost) {
        ironPlates -= storageUpgradeCost;
        storageCap = Math.floor(storageCap * 2);
        storageUpgradeCost = Math.floor(storageUpgradeCost * 2.5);
        updateUI();
    }
});

// Research Unlocks
document.getElementById("unlock-smelting-btn").addEventListener("click", () => {
    if (ironOre >= 50) { ironOre -= 50; unlockedSmelting = true; updateUI(); }
});
document.getElementById("unlock-electronics-btn").addEventListener("click", () => {
    if (ironPlates >= 50) { ironPlates -= 50; unlockedElectronics = true; updateUI(); }
});

// Upgrades
document.getElementById("upg-pickaxe-btn").addEventListener("click", () => {
    if (circuitBoards >= 10 && !upgPickaxe) { circuitBoards -= 10; upgPickaxe = true; updateUI(); }
});
document.getElementById("upg-miners-btn").addEventListener("click", () => {
    if (circuitBoards >= 25 && !upgMiners) { circuitBoards -= 25; upgMiners = true; updateUI(); }
});
document.getElementById("upg-smelters-btn").addEventListener("click", () => {
    if (circuitBoards >= 50 && !upgSmelters) { circuitBoards -= 50; upgSmelters = true; updateUI(); }
});

// Expand Grid Land
document.getElementById("buy-land-btn").addEventListener("click", () => {
    if (ironPlates >= landCost) {
        ironPlates -= landCost;
        canvasSize += 80; // Adds 2 full grid rows and columns
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        landCost = Math.floor(landCost * 2.2);
        updateUI();
        renderCanvas();
    }
});

// --- 6. THE FACTORY AUTOMATION ENGINE ---
setInterval(() => {
    let activeIronMiners = placedMachines.filter(m => m.type === "ironMiner").length;
    let activeCopperMiners = placedMachines.filter(m => m.type === "copperMiner").length;
    let activeCoalMiners = placedMachines.filter(m => m.type === "coalMiner").length;
    let activeSmelters = placedMachines.filter(m => m.type === "smelter").length;
    let activeEngines = placedMachines.filter(m => m.type === "engine").length;
    let activeExtruders = placedMachines.filter(m => m.type === "extruder").length;
    let activeAssemblers = placedMachines.filter(m => m.type === "assembler").length;

    let smelterRunning = false;
    let extruderRunning = false;
    let assemblerRunning = false;

    let minerMulti = upgMiners ? 2 : 1;
    if (activeIronMiners > 0) ironOre = Math.min(ironOre + (activeIronMiners * minerMulti), storageCap);
    if (activeCopperMiners > 0) copperOre = Math.min(copperOre + (activeCopperMiners * minerMulti), storageCap);
    if (activeCoalMiners > 0) coal = Math.min(coal + (activeCoalMiners * minerMulti), storageCap);

    let usedEngines = Math.min(activeEngines, coal);
    coal -= usedEngines;
    powerSupply = usedEngines * 10;
    powerDemand = (activeExtruders * 2) + (activeAssemblers * 5);

    if (activeSmelters > 0) {
        let spaceLeft = storageCap - ironPlates;
        let amount = upgSmelters ? Math.min(ironOre, activeSmelters, spaceLeft) : Math.min(ironOre, coal, activeSmelters, spaceLeft);
        if (amount > 0) {
            ironOre -= amount;
            if (!upgSmelters) coal -= amount;
            ironPlates += amount;
            smelterRunning = true;
        }
    }

    if (powerSupply >= powerDemand && powerDemand > 0) {
        if (activeExtruders > 0) {
            let spaceLeft = storageCap - copperWire;
            let amount = Math.min(copperOre, activeExtruders, Math.floor(spaceLeft / 2));
            if (amount > 0) {
                copperOre -= amount;
                copperWire += (amount * 2);
                extruderRunning = true;
            }
        }
        if (activeAssemblers > 0) {
            let spaceLeft = storageCap - circuitBoards;
            let amount = Math.min(ironPlates, Math.floor(copperWire / 2), activeAssemblers, spaceLeft);
            if (amount > 0) {
                ironPlates -= amount;
                copperWire -= (amount * 2);
                circuitBoards += amount;
                assemblerRunning = true;
            }
        }
    }

    const sp = document.getElementById("smelter-progress");
    const ep = document.getElementById("extruder-progress");
    const ap = document.getElementById("assembler-progress");
    if (sp) { if (smelterRunning) sp.classList.add("running"); else sp.classList.remove("running"); }
    if (ep) { if (extruderRunning) ep.classList.add("running"); else ep.classList.remove("running"); }
    if (ap) { if (assemblerRunning) ap.classList.add("running"); else ap.classList.remove("running"); }

    updateUI();
}, 1000);

// --- 7. UI REFRESH ---
function updateUI() {
    document.getElementById("storage-cap-1").innerText = storageCap;
    document.getElementById("storage-cap-2").innerText = storageCap;
    document.getElementById("storage-upgrade-cost").innerText = storageUpgradeCost;

    document.getElementById("iron-count").innerText = ironOre;
    document.getElementById("miner-cost").innerText = ironMinerCost;
    document.getElementById("copper-count").innerText = copperOre;
    document.getElementById("copper-miner-cost").innerText = copperMinerCost;
    document.getElementById("coal-count").innerText = coal;
    document.getElementById("coal-miner-cost").innerText = coalMinerCost;

    document.getElementById("iron-plate-count").innerText = ironPlates;
    document.getElementById("smelter-cost").innerText = smelterCost;
    document.getElementById("copper-wire-count").innerText = copperWire;
    document.getElementById("extruder-cost").innerText = extruderCost;
    document.getElementById("circuit-board-count").innerText = circuitBoards;
    document.getElementById("assembler-cost").innerText = assemblerCost;

    document.getElementById("engine-cost").innerText = steamEngineCost;
    document.getElementById("land-cost").innerText = landCost;

    const ps = document.getElementById("power-status");
    ps.innerText = `${powerSupply} kW / ${powerDemand} kW`;
    if (powerDemand > powerSupply) ps.classList.add("power-shortage");
    else ps.classList.remove("power-shortage");

    // Unplaced Inventory Counts
    document.getElementById("unplaced-iron-miners").innerText = unplacedIron;
    document.getElementById("unplaced-copper-miners").innerText = unplacedCopper;
    document.getElementById("unplaced-coal-miners").innerText = unplacedCoal;
    document.getElementById("unplaced-smelters").innerText = unplacedSmelters;
    document.getElementById("unplaced-engines").innerText = unplacedEngines;
    document.getElementById("unplaced-extruders").innerText = unplacedExtruders;
    document.getElementById("unplaced-assemblers").innerText = unplacedAssemblers;

    // Progression Reveals
    if (unlockedSmelting) {
        document.getElementById("coal-inv").classList.remove("hidden");
        document.getElementById("plate-inv").classList.remove("hidden");
        document.getElementById("coal-action").classList.remove("hidden");
        document.getElementById("smelting-action").classList.remove("hidden");
        document.getElementById("place-coal-miner").classList.remove("hidden");
        document.getElementById("place-smelter").classList.remove("hidden");
        document.getElementById("unlock-smelting-btn").classList.add("hidden");
        if (!unlockedElectronics) document.getElementById("unlock-electronics-btn").classList.remove("hidden");
    }

    if (unlockedElectronics) {
        document.getElementById("copper-inv").classList.remove("hidden");
        document.getElementById("advanced-inv").classList.remove("hidden");
        document.getElementById("copper-action").classList.remove("hidden");
        document.getElementById("advanced-action").classList.remove("hidden");
        document.getElementById("power-grid").classList.remove("hidden");
        document.getElementById("upgrades-action").classList.remove("hidden");
        document.getElementById("place-copper-miner").classList.remove("hidden");
        document.getElementById("place-engine").classList.remove("hidden");
        document.getElementById("place-extruder").classList.remove("hidden");
        document.getElementById("place-assembler").classList.remove("hidden");
        document.getElementById("unlock-electronics-btn").classList.add("hidden");
    }

    if (unlockedSmelting && unlockedElectronics) {
        document.getElementById("research-section").classList.add("hidden");
    }

    // Upgrades
    const upg1 = document.getElementById("upg-pickaxe-btn");
    const upg2 = document.getElementById("upg-miners-btn");
    const upg3 = document.getElementById("upg-smelters-btn");
    if (upgPickaxe) { upg1.classList.add("purchased"); upg1.innerText = "🛠️ Steel Pickaxe (Purchased)"; }
    if (upgMiners) { upg2.classList.add("purchased"); upg2.innerText = "⚡ Overclock Miners (Purchased)"; }
    if (upgSmelters) { upg3.classList.add("purchased"); upg3.innerText = "🔥 Carbon Smelting (Purchased)"; }
}

// --- 8. PERSISTENT SAVE & LOAD SYSTEM ---
function saveGame() {
    const gameData = {
        storageCap, storageUpgradeCost, ironOre, ironMinerCost, copperOre, copperMinerCost, coal, coalMinerCost,
        ironPlates, smelterCost, copperWire, extruderCost, circuitBoards, assemblerCost, steamEngineCost,
        unplacedIron, unplacedCopper, unplacedCoal, unplacedSmelters, unplacedEngines, unplacedExtruders, unplacedAssemblers,
        unlockedSmelting, unlockedElectronics, upgPickaxe, upgMiners, upgSmelters, placedMachines, canvasSize, landCost
    };
    localStorage.setItem("factorySave", JSON.stringify(gameData));
    lastSaveTime = Date.now();
    const saveTracker = document.getElementById("time-since-save");
    if (saveTracker) saveTracker.innerText = "Last saved: Just now";
}

function loadGame() {
    try {
        const savedData = localStorage.getItem("factorySave");
        if (savedData) {
            const d = JSON.parse(savedData);
            if (d.storageCap !== undefined) storageCap = d.storageCap;
            if (d.storageUpgradeCost !== undefined) storageUpgradeCost = d.storageUpgradeCost;
            if (d.ironOre !== undefined) ironOre = d.ironOre;
            if (d.ironMinerCost !== undefined) ironMinerCost = d.ironMinerCost;
            if (d.copperOre !== undefined) copperOre = d.copperOre;
            if (d.copperMinerCost !== undefined) copperMinerCost = d.copperMinerCost;
            if (d.coal !== undefined) coal = d.coal;
            if (d.coalMinerCost !== undefined) coalMinerCost = d.coalMinerCost;
            if (d.ironPlates !== undefined) ironPlates = d.ironPlates;
            if (d.smelterCost !== undefined) smelterCost = d.smelterCost;
            if (d.copperWire !== undefined) copperWire = d.copperWire;
            if (d.extruderCost !== undefined) extruderCost = d.extruderCost;
            if (d.circuitBoards !== undefined) circuitBoards = d.circuitBoards;
            if (d.assemblerCost !== undefined) assemblerCost = d.assemblerCost;
            if (d.steamEngineCost !== undefined) steamEngineCost = d.steamEngineCost;

            if (d.unplacedIron !== undefined) unplacedIron = d.unplacedIron;
            if (d.unplacedCopper !== undefined) unplacedCopper = d.unplacedCopper;
            if (d.unplacedCoal !== undefined) unplacedCoal = d.unplacedCoal;
            if (d.unplacedSmelters !== undefined) unplacedSmelters = d.unplacedSmelters;
            if (d.unplacedEngines !== undefined) unplacedEngines = d.unplacedEngines;
            if (d.unplacedExtruders !== undefined) unplacedExtruders = d.unplacedExtruders;
            if (d.unplacedAssemblers !== undefined) unplacedAssemblers = d.unplacedAssemblers;

            if (d.unlockedSmelting !== undefined) unlockedSmelting = d.unlockedSmelting;
            if (d.unlockedElectronics !== undefined) unlockedElectronics = d.unlockedElectronics;
            if (d.upgPickaxe !== undefined) upgPickaxe = d.upgPickaxe;
            if (d.upgMiners !== undefined) upgMiners = d.upgMiners;
            if (d.upgSmelters !== undefined) upgSmelters = d.upgSmelters;

            if (Array.isArray(d.placedMachines)) placedMachines = d.placedMachines;
            if (d.canvasSize !== undefined) {
                canvasSize = d.canvasSize;
                canvas.width = canvasSize;
                canvas.height = canvasSize;
            }
            if (d.landCost !== undefined) landCost = d.landCost;
        }
    } catch (err) {
        console.error("Save file corrupted, starting clean:", err);
    }
    updateUI();
    renderCanvas();
}

setInterval(saveGame, 10000);
document.getElementById("save-btn").addEventListener("click", () => {
    saveGame();
    alert("Game manually saved!");
});

document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to wipe all progress?")) {
        localStorage.removeItem("factorySave");
        location.reload();
    }
});

// Save Export/Import
document.getElementById("export-btn").addEventListener("click", () => {
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

document.getElementById("import-file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) {
        const r = new FileReader();
        r.onload = function(ev) {
            try {
                localStorage.setItem("factorySave", JSON.stringify(JSON.parse(ev.target.result)));
                alert("Save imported successfully!");
                location.reload();
            } catch (err) {
                alert("Invalid save file!");
            }
        };
        r.readAsText(f);
    }
});

// Run load on start
loadGame();