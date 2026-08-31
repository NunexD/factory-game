// --- 1. THEME & MODAL SETUP ---
const body = document.body;
const themeToggleBtn = document.getElementById("theme-toggle");
if (localStorage.getItem("theme") === "dark") { body.classList.add("dark-mode"); themeToggleBtn.innerText = "☀️ Light Mode"; }
themeToggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    themeToggleBtn.innerText = body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
});
const settingsBtn = document.getElementById("settings-btn"); const settingsModal = document.getElementById("settings-modal"); const closeModal = document.getElementById("close-modal");
settingsBtn.addEventListener("click", () => { settingsModal.style.display = "flex"; }); closeModal.addEventListener("click", () => { settingsModal.style.display = "none"; });
window.addEventListener("click", (e) => { if (e.target === settingsModal) settingsModal.style.display = "none"; });

// --- 2. GAME STATE VARIABLES ---
let storageCap = 100; let storageUpgradeCost = 25;
let ironOre = 0; let copperOre = 0; let coal = 0;
let ironPlates = 0; let copperWire = 0; let circuitBoards = 0;

let ironMinerCost = 10; let copperMinerCost = 10; let coalMinerCost = 10;
let smelterCost = 20; let extruderCost = 25; let assemblerCost = 30; let steamEngineCost = 20;

let unplacedIron = 0; let unplacedCopper = 0; let unplacedCoal = 0;
let unplacedSmelters = 0; let unplacedEngines = 0; let unplacedExtruders = 0; let unplacedAssemblers = 0;

let powerSupply = 0; let powerDemand = 0;
let unlockedSmelting = false; let unlockedElectronics = false;
let upgPickaxe = false; let upgMiners = false; let upgSmelters = false;

let canvasSize = 480; let landCost = 50;
let travelingItems = [];

// --- 3. CANVAS & PHYSICS ENGINE ---
const canvas = document.getElementById("factory-floor");
const ctx = canvas.getContext("2d");
const tileSize = 40;
let placedMachines = [];
let currentBuildMode = "pickup";
let hoverGridX = -1; let hoverGridY = -1;
let currentRotation = 0;

const machineStats = {
    belt:        { w: 1, h: 1, color: "#555555", name: "Belt" },
    core:        { w: 3, h: 3, color: "#FBC02D", name: "STORAGE CORE" },
    ironMiner:   { w: 1, h: 1, color: "#78909C", name: "Iron Miner" },
    copperMiner: { w: 1, h: 1, color: "#D87D4A", name: "Copper Miner" },
    coalMiner:   { w: 1, h: 1, color: "#37474F", name: "Coal Miner" },
    smelter:     { w: 2, h: 3, color: "#E64A19", name: "Smelter" },
    engine:      { w: 2, h: 2, color: "#C2185B", name: "Engine" },
    extruder:    { w: 2, h: 2, color: "#00ACC1", name: "Extruder" },
    assembler:   { w: 3, h: 3, color: "#7B1FA2", name: "Assembler" }
};

window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === 'r') { currentRotation = (currentRotation + 1) % 4; renderGraphics(); }
});

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = body.classList.contains("dark-mode") ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += tileSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= canvas.height; y += tileSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
}

function checkCollision(gridX, gridY, w, h) {
    if (gridX < 0 || gridY < 0 || gridX + w > canvas.width / tileSize || gridY + h > canvas.height / tileSize) return true;
    for (let m of placedMachines) {
        let stat = machineStats[m.type];
        if (gridX < m.x + stat.w && gridX + w > m.x && gridY < m.y + stat.h && gridY + h > m.y) return true;
    }
    return false;
}

// ADJACENCY MATH (Checks if two machines are touching edges)
function isAdjacent(m1, stat1, m2, stat2) {
    let horizontallyAdjacent = (m1.x === m2.x + stat2.w || m1.x + stat1.w === m2.x) && (m1.y < m2.y + stat2.h && m1.y + stat1.h > m2.y);
    let verticallyAdjacent = (m1.y === m2.y + stat2.h || m1.y + stat1.h === m2.y) && (m1.x < m2.x + stat2.w && m1.x + stat1.w > m2.x);
    return horizontallyAdjacent || verticallyAdjacent;
}

function drawArrow(x, y, dir, size) {
    ctx.fillStyle = "#FFF"; ctx.save();
    ctx.translate(x + size / 2, y + size / 2); ctx.rotate((dir * 90) * Math.PI / 180);
    ctx.beginPath(); ctx.moveTo(-5, 10); ctx.lineTo(5, 10); ctx.lineTo(5, -2); ctx.lineTo(10, -2); ctx.lineTo(0, -12); ctx.lineTo(-10, -2); ctx.lineTo(-5, -2); ctx.closePath(); ctx.fill();
    ctx.restore();
}

function renderGraphics() {
    drawGrid();

    placedMachines.forEach(m => {
        let stat = machineStats[m.type];
        let px = m.x * tileSize; let py = m.y * tileSize;
        let pw = stat.w * tileSize; let ph = stat.h * tileSize;
        ctx.fillStyle = stat.color; ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4);

        if (m.type === "belt") {
            drawArrow(px, py, m.dir, tileSize);
        } else {
            ctx.fillStyle = (m.type === "core") ? "#000" : "#FFFFFF";
            ctx.font = "bold 11px Arial";
            ctx.fillText(stat.name, px + 6, py + 18);
        }
    });

    travelingItems.forEach(item => {
        ctx.beginPath();
        if (item.type.includes("Plates") || item.type.includes("Wire") || item.type.includes("Boards")) {
            ctx.rect(item.x - 6, item.y - 6, 12, 12);
        } else {
            ctx.arc(item.x, item.y, 6, 0, Math.PI * 2);
        }

        if (item.type === "ironOre") ctx.fillStyle = "#B0BEC5";
        if (item.type === "copperOre") ctx.fillStyle = "#FF7043";
        if (item.type === "coal") ctx.fillStyle = "#212121";
        if (item.type === "ironPlates") ctx.fillStyle = "#E0E0E0";
        if (item.type === "copperWire") ctx.fillStyle = "#FFB74D";
        if (item.type === "circuitBoards") ctx.fillStyle = "#66BB6A";

        ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = "#fff"; ctx.stroke();
    });

    if (currentBuildMode !== "pickup" && hoverGridX >= 0 && hoverGridY >= 0) {
        let stat = machineStats[currentBuildMode];
        if (stat) {
            let collides = checkCollision(hoverGridX, hoverGridY, stat.w, stat.h);
            ctx.fillStyle = collides ? "rgba(229, 57, 53, 0.55)" : "rgba(67, 160, 71, 0.55)";
            let gx = hoverGridX * tileSize; let gy = hoverGridY * tileSize;
            ctx.fillRect(gx, gy, stat.w * tileSize, stat.h * tileSize);
            if (currentBuildMode === "belt") drawArrow(gx, gy, currentRotation, tileSize);
        }
    }
}

// Global Storage Adder
function addToGlobalStorage(type, amount) {
    if (type === "ironOre") ironOre = Math.min(storageCap, ironOre + amount);
    if (type === "copperOre") copperOre = Math.min(storageCap, copperOre + amount);
    if (type === "coal") coal = Math.min(storageCap, coal + amount);
    if (type === "ironPlates") ironPlates = Math.min(storageCap, ironPlates + amount);
    if (type === "copperWire") copperWire = Math.min(storageCap, copperWire + amount);
    if (type === "circuitBoards") circuitBoards = Math.min(storageCap, circuitBoards + amount);
}

// 60FPS PHYSICS & LOGISTICS LOOP
function gameLoop() {
    const speed = 1.5;

    for (let i = travelingItems.length - 1; i >= 0; i--) {
        let item = travelingItems[i];
        let absorbed = false;

        let machineUnderneath = placedMachines.find(m => {
            let stat = machineStats[m.type];
            let mx = m.x * tileSize; let my = m.y * tileSize;
            let mw = stat.w * tileSize; let mh = stat.h * tileSize;
            return item.x >= mx && item.x < mx + mw && item.y >= my && item.y < my + mh;
        });

        if (machineUnderneath) {
            if (machineUnderneath.type === "belt") {
                if (machineUnderneath.dir === 0) item.y -= speed;
                if (machineUnderneath.dir === 1) item.x += speed;
                if (machineUnderneath.dir === 2) item.y += speed;
                if (machineUnderneath.dir === 3) item.x -= speed;

                if (machineUnderneath.dir === 0 || machineUnderneath.dir === 2) {
                    item.x += ((machineUnderneath.x * tileSize + tileSize/2) - item.x) * 0.1;
                } else {
                    item.y += ((machineUnderneath.y * tileSize + tileSize/2) - item.y) * 0.1;
                }
            }
            else if (machineUnderneath.type === "core") {
                addToGlobalStorage(item.type, 1);
                absorbed = true;
                updateUI();
            }
            else if (!machineUnderneath.type.includes("Miner")) {
                if (!machineUnderneath.inv) machineUnderneath.inv = {};
                machineUnderneath.inv[item.type] = (machineUnderneath.inv[item.type] || 0) + 1;
                absorbed = true;
            }
        }
        if (absorbed) { travelingItems.splice(i, 1); }
    }

    renderGraphics();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// --- INPUT HANDLING ---
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    hoverGridX = Math.floor((event.clientX - rect.left) / tileSize);
    hoverGridY = Math.floor((event.clientY - rect.top) / tileSize);
});
canvas.addEventListener("mouseleave", () => { hoverGridX = -1; hoverGridY = -1; });

canvas.addEventListener("click", () => {
    if (hoverGridX < 0 || hoverGridY < 0) return;
    if (currentBuildMode === "pickup") {
        for (let i = 0; i < placedMachines.length; i++) {
            let m = placedMachines[i]; let stat = machineStats[m.type];
            if (hoverGridX >= m.x && hoverGridX < m.x + stat.w && hoverGridY >= m.y && hoverGridY < m.y + stat.h) {
                if (m.type === "core") return;
                if (m.type === "belt") ironPlates++;
                if (m.type === "ironMiner") unplacedIron++; if (m.type === "copperMiner") unplacedCopper++; if (m.type === "coalMiner") unplacedCoal++;
                if (m.type === "smelter") unplacedSmelters++; if (m.type === "engine") unplacedEngines++;
                if (m.type === "extruder") unplacedExtruders++; if (m.type === "assembler") unplacedAssemblers++;
                placedMachines.splice(i, 1); updateUI(); return;
            }
        }
    } else {
        let stat = machineStats[currentBuildMode];
        if (!stat) return;
        if (!checkCollision(hoverGridX, hoverGridY, stat.w, stat.h)) {
            let canPlace = false;
            if (currentBuildMode === "belt" && ironPlates >= 1) { ironPlates--; canPlace = true; }
            if (currentBuildMode === "ironMiner" && unplacedIron > 0) { unplacedIron--; canPlace = true; }
            if (currentBuildMode === "copperMiner" && unplacedCopper > 0) { unplacedCopper--; canPlace = true; }
            if (currentBuildMode === "coalMiner" && unplacedCoal > 0) { unplacedCoal--; canPlace = true; }
            if (currentBuildMode === "smelter" && unplacedSmelters > 0) { unplacedSmelters--; canPlace = true; }
            if (currentBuildMode === "engine" && unplacedEngines > 0) { unplacedEngines--; canPlace = true; }
            if (currentBuildMode === "extruder" && unplacedExtruders > 0) { unplacedExtruders--; canPlace = true; }
            if (currentBuildMode === "assembler" && unplacedAssemblers > 0) { unplacedAssemblers--; canPlace = true; }

            if (canPlace) {
                placedMachines.push({ type: currentBuildMode, x: hoverGridX, y: hoverGridY, dir: currentRotation, inv: {} });
                updateUI();
            }
        }
    }
});

function setTool(mode, btnId) {
    currentBuildMode = mode;
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(btnId).classList.add("active");
    const titleMap = { pickup: "🖐️ Pick Up Tool", belt: "🛤️ Conveyor Belt", ironMiner: "Iron Miner", copperMiner: "Copper Miner", coalMiner: "Coal Miner", smelter: "Smelter", engine: "Steam Engine", extruder: "Extruder", assembler: "Assembler" };
    document.getElementById("current-mode-display").innerText = titleMap[mode];
}
document.getElementById("mode-pickup").addEventListener("click", () => setTool("pickup", "mode-pickup"));
document.getElementById("place-belt").addEventListener("click", () => setTool("belt", "place-belt"));
document.getElementById("place-iron-miner").addEventListener("click", () => setTool("ironMiner", "place-iron-miner"));
document.getElementById("place-copper-miner").addEventListener("click", () => setTool("copperMiner", "place-copper-miner"));
document.getElementById("place-coal-miner").addEventListener("click", () => setTool("coalMiner", "place-coal-miner"));
document.getElementById("place-smelter").addEventListener("click", () => setTool("smelter", "place-smelter"));
document.getElementById("place-engine").addEventListener("click", () => setTool("engine", "place-engine"));
document.getElementById("place-extruder").addEventListener("click", () => setTool("extruder", "place-extruder"));
document.getElementById("place-assembler").addEventListener("click", () => setTool("assembler", "place-assembler"));

// Buttons
document.getElementById("mine-iron-btn").addEventListener("click", () => { let y = upgPickaxe ? 3 : 1; addToGlobalStorage("ironOre", y); updateUI(); });
document.getElementById("mine-copper-btn").addEventListener("click", () => { let y = upgPickaxe ? 3 : 1; addToGlobalStorage("copperOre", y); updateUI(); });
document.getElementById("mine-coal-btn").addEventListener("click", () => { let y = upgPickaxe ? 3 : 1; addToGlobalStorage("coal", y); updateUI(); });
document.getElementById("buy-miner-btn").addEventListener("click", () => { if (ironOre >= ironMinerCost) { ironOre -= ironMinerCost; unplacedIron++; ironMinerCost = Math.floor(ironMinerCost * 1.5); updateUI(); }});
document.getElementById("buy-copper-miner-btn").addEventListener("click", () => { if (copperOre >= copperMinerCost) { copperOre -= copperMinerCost; unplacedCopper++; copperMinerCost = Math.floor(copperMinerCost * 1.5); updateUI(); }});
document.getElementById("buy-coal-miner-btn").addEventListener("click", () => { if (coal >= coalMinerCost) { coal -= coalMinerCost; unplacedCoal++; coalMinerCost = Math.floor(coalMinerCost * 1.5); updateUI(); }});
document.getElementById("buy-smelter-btn").addEventListener("click", () => { if (ironOre >= smelterCost) { ironOre -= smelterCost; unplacedSmelters++; smelterCost = Math.floor(smelterCost * 1.5); updateUI(); }});
document.getElementById("buy-engine-btn").addEventListener("click", () => { if (ironPlates >= steamEngineCost) { ironPlates -= steamEngineCost; unplacedEngines++; steamEngineCost = Math.floor(steamEngineCost * 1.5); updateUI(); }});
document.getElementById("buy-extruder-btn").addEventListener("click", () => { if (copperOre >= extruderCost) { copperOre -= extruderCost; unplacedExtruders++; extruderCost = Math.floor(extruderCost * 1.5); updateUI(); }});
document.getElementById("buy-assembler-btn").addEventListener("click", () => { if (ironPlates >= assemblerCost) { ironPlates -= assemblerCost; unplacedAssemblers++; assemblerCost = Math.floor(assemblerCost * 1.5); updateUI(); }});
document.getElementById("upgrade-storage-btn").addEventListener("click", () => { if (ironPlates >= storageUpgradeCost) { ironPlates -= storageUpgradeCost; storageCap = Math.floor(storageCap * 2); storageUpgradeCost = Math.floor(storageUpgradeCost * 2.5); updateUI(); }});
document.getElementById("unlock-smelting-btn").addEventListener("click", () => { if (ironOre >= 50) { ironOre -= 50; unlockedSmelting = true; updateUI(); }});
document.getElementById("unlock-electronics-btn").addEventListener("click", () => { if (ironPlates >= 50) { ironPlates -= 50; unlockedElectronics = true; updateUI(); }});
document.getElementById("upg-pickaxe-btn").addEventListener("click", () => { if (circuitBoards >= 10 && !upgPickaxe) { circuitBoards -= 10; upgPickaxe = true; updateUI(); }});
document.getElementById("upg-miners-btn").addEventListener("click", () => { if (circuitBoards >= 25 && !upgMiners) { circuitBoards -= 25; upgMiners = true; updateUI(); }});
document.getElementById("upg-smelters-btn").addEventListener("click", () => { if (circuitBoards >= 50 && !upgSmelters) { circuitBoards -= 50; upgSmelters = true; updateUI(); }});
document.getElementById("buy-land-btn").addEventListener("click", () => { if (ironPlates >= landCost) { ironPlates -= landCost; canvasSize += 80; canvas.width = canvasSize; canvas.height = canvasSize; landCost = Math.floor(landCost * 2.2); updateUI(); } });

// --- 5. 1-SECOND ECONOMY & DIRECT INSERTION ---
function attemptOutput(m, stat, itemType, amount) {
    // 1. Direct Insertion to Core
    let core = placedMachines.find(c => c.type === "core" && isAdjacent(m, stat, c, machineStats.core));
    if (core) {
        addToGlobalStorage(itemType, amount);
        return true;
    }

    // 2. Direct Insertion to Processing Machine
    let procMachine = placedMachines.find(p => p !== m && p.type !== "belt" && p.type !== "core" && !p.type.includes("Miner") && isAdjacent(m, stat, p, machineStats[p.type]));
    if (procMachine) {
        if (!procMachine.inv) procMachine.inv = {};
        procMachine.inv[itemType] = (procMachine.inv[itemType] || 0) + amount;
        return true;
    }

    // 3. Output to Belt
    let belt = placedMachines.find(b => b.type === "belt" && isAdjacent(m, stat, b, machineStats.belt));
    if (belt) {
        for(let i = 0; i < amount; i++) {
            setTimeout(() => { travelingItems.push({ type: itemType, x: belt.x * tileSize + tileSize/2, y: belt.y * tileSize + tileSize/2 }); }, i * 300);
        }
        return true;
    }
    return false; // Nowhere to output, machine stalls!
}

setInterval(() => {
    let activeEngines = placedMachines.filter(m => m.type === "engine");
    let activeExtruders = placedMachines.filter(m => m.type === "extruder");
    let activeAssemblers = placedMachines.filter(m => m.type === "assembler");

    // Power
    let totalCoalInEngines = activeEngines.reduce((sum, e) => sum + (e.inv?.coal || 0), 0);
    let usedEngines = Math.min(activeEngines.length, totalCoalInEngines);
    let enginesToConsume = usedEngines;
    activeEngines.forEach(e => { if (enginesToConsume > 0 && e.inv && e.inv.coal > 0) { e.inv.coal--; enginesToConsume--; } });

    powerSupply = usedEngines * 10;
    powerDemand = (activeExtruders.length * 2) + (activeAssemblers.length * 5);
    let hasPower = (powerSupply >= powerDemand && powerDemand > 0) || powerDemand === 0;

    placedMachines.forEach(m => {
        let stat = machineStats[m.type];
        if (!m.inv) m.inv = {};

        if (m.type.includes("Miner")) {
            let resType = m.type === "ironMiner" ? "ironOre" : m.type === "copperMiner" ? "copperOre" : "coal";
            let amount = upgMiners ? 2 : 1;
            attemptOutput(m, stat, resType, amount);
        }

        if (m.type === "smelter") {
            let coalNeeded = upgSmelters ? 0 : 1;
            if ((m.inv.ironOre || 0) >= 1 && (m.inv.coal || 0) >= coalNeeded) {
                if (attemptOutput(m, stat, "ironPlates", 1)) {
                    m.inv.ironOre--; if (!upgSmelters) m.inv.coal--;
                }
            }
        }

        if (m.type === "extruder" && hasPower) {
            if ((m.inv.copperOre || 0) >= 1) {
                if (attemptOutput(m, stat, "copperWire", 2)) {
                    m.inv.copperOre--;
                }
            }
        }

        if (m.type === "assembler" && hasPower) {
            if ((m.inv.ironPlates || 0) >= 1 && (m.inv.copperWire || 0) >= 2) {
                if (attemptOutput(m, stat, "circuitBoards", 1)) {
                    m.inv.ironPlates--; m.inv.copperWire -= 2;
                }
            }
        }
    });

    updateUI();
}, 1000);

// --- 6. UI & SAVING ---
function updateUI() {
    document.getElementById("storage-cap-1").innerText = storageCap;
    document.getElementById("storage-upgrade-cost").innerText = storageUpgradeCost;
    document.getElementById("iron-count").innerText = ironOre; document.getElementById("miner-cost").innerText = ironMinerCost;
    document.getElementById("copper-count").innerText = copperOre; document.getElementById("copper-miner-cost").innerText = copperMinerCost;
    document.getElementById("coal-count").innerText = coal; document.getElementById("coal-miner-cost").innerText = coalMinerCost;
    document.getElementById("iron-plate-count").innerText = ironPlates; document.getElementById("smelter-cost").innerText = smelterCost;
    document.getElementById("copper-wire-count").innerText = copperWire; document.getElementById("extruder-cost").innerText = extruderCost;
    document.getElementById("circuit-board-count").innerText = circuitBoards; document.getElementById("assembler-cost").innerText = assemblerCost;
    document.getElementById("engine-cost").innerText = steamEngineCost; document.getElementById("land-cost").innerText = landCost;

    const ps = document.getElementById("power-status"); ps.innerText = `${powerSupply} kW / ${powerDemand} kW`;
    if (powerDemand > powerSupply && powerDemand > 0) ps.classList.add("power-shortage"); else ps.classList.remove("power-shortage");

    document.getElementById("unplaced-iron-miners").innerText = unplacedIron; document.getElementById("unplaced-copper-miners").innerText = unplacedCopper;
    document.getElementById("unplaced-coal-miners").innerText = unplacedCoal; document.getElementById("unplaced-smelters").innerText = unplacedSmelters;
    document.getElementById("unplaced-engines").innerText = unplacedEngines; document.getElementById("unplaced-extruders").innerText = unplacedExtruders;
    document.getElementById("unplaced-assemblers").innerText = unplacedAssemblers;

    if (unlockedSmelting) {
        document.getElementById("coal-inv").classList.remove("hidden"); document.getElementById("plate-inv").classList.remove("hidden");
        document.getElementById("coal-action").classList.remove("hidden"); document.getElementById("smelting-action").classList.remove("hidden");
        document.getElementById("place-coal-miner").classList.remove("hidden"); document.getElementById("place-smelter").classList.remove("hidden");
        document.getElementById("unlock-smelting-btn").classList.add("hidden"); if (!unlockedElectronics) document.getElementById("unlock-electronics-btn").classList.remove("hidden");
    }
    if (unlockedElectronics) {
        document.getElementById("copper-inv").classList.remove("hidden"); document.getElementById("advanced-inv").classList.remove("hidden");
        document.getElementById("copper-action").classList.remove("hidden"); document.getElementById("advanced-action").classList.remove("hidden");
        document.getElementById("power-grid").classList.remove("hidden"); document.getElementById("upgrades-action").classList.remove("hidden");
        document.getElementById("place-copper-miner").classList.remove("hidden"); document.getElementById("place-engine").classList.remove("hidden");
        document.getElementById("place-extruder").classList.remove("hidden"); document.getElementById("place-assembler").classList.remove("hidden");
        document.getElementById("unlock-electronics-btn").classList.add("hidden");
    }
    if (unlockedSmelting && unlockedElectronics) document.getElementById("research-section").classList.add("hidden");

    const upg1 = document.getElementById("upg-pickaxe-btn"); const upg2 = document.getElementById("upg-miners-btn"); const upg3 = document.getElementById("upg-smelters-btn");
    if (upgPickaxe) { upg1.classList.add("purchased"); upg1.innerText = "🛠️ Steel Pickaxe (Purchased)"; }
    if (upgMiners) { upg2.classList.add("purchased"); upg2.innerText = "⚡ Overclock Miners (Purchased)"; }
    if (upgSmelters) { upg3.classList.add("purchased"); upg3.innerText = "🔥 Carbon Smelting (Purchased)"; }
}

function saveGame() {
    const gameData = { storageCap, ironOre, ironMinerCost, copperOre, copperMinerCost, coal, coalMinerCost, ironPlates, smelterCost, copperWire, extruderCost, circuitBoards, assemblerCost, steamEngineCost, unplacedIron, unplacedCopper, unplacedCoal, unplacedSmelters, unplacedEngines, unplacedExtruders, unplacedAssemblers, unlockedSmelting, unlockedElectronics, upgPickaxe, upgMiners, upgSmelters, placedMachines, canvasSize, landCost };
    localStorage.setItem("factorySave", JSON.stringify(gameData));
}
function loadGame() {
    try {
        const d = JSON.parse(localStorage.getItem("factorySave"));
        if (d) {
            storageCap = d.storageCap || 100; ironOre = d.ironOre || 0; ironMinerCost = d.ironMinerCost || 10; copperOre = d.copperOre || 0; copperMinerCost = d.copperMinerCost || 10; coal = d.coal || 0; coalMinerCost = d.coalMinerCost || 10; ironPlates = d.ironPlates || 0; smelterCost = d.smelterCost || 20; copperWire = d.copperWire || 0; extruderCost = d.extruderCost || 25; circuitBoards = d.circuitBoards || 0; assemblerCost = d.assemblerCost || 30; steamEngineCost = d.steamEngineCost || 20; unplacedIron = d.unplacedIron || 0; unplacedCopper = d.unplacedCopper || 0; unplacedCoal = d.unplacedCoal || 0; unplacedSmelters = d.unplacedSmelters || 0; unplacedEngines = d.unplacedEngines || 0; unplacedExtruders = d.unplacedExtruders || 0; unplacedAssemblers = d.unplacedAssemblers || 0; unlockedSmelting = d.unlockedSmelting || false; unlockedElectronics = d.unlockedElectronics || false; upgPickaxe = d.upgPickaxe || false; upgMiners = d.upgMiners || false; upgSmelters = d.upgSmelters || false; placedMachines = d.placedMachines || [];
            if (d.canvasSize) { canvasSize = d.canvasSize; canvas.width = canvasSize; canvas.height = canvasSize; }
            landCost = d.landCost || 50;
        }
    } catch (err) {}

    if (!placedMachines.some(m => m.type === "core")) {
        placedMachines.push({ type: "core", x: 4, y: 4, inv: {} });
    }
    updateUI();
}
document.getElementById("save-btn").addEventListener("click", () => { saveGame(); alert("Saved!"); });
document.getElementById("reset-btn").addEventListener("click", () => { if (confirm("Wipe data?")) { localStorage.clear(); location.reload(); } });
loadGame(); setInterval(saveGame, 10000);