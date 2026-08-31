// --- GAME STATE VARIABLES ---

// Iron Variables
let ironOre = 0;
let ironMiners = 0;
let ironMinerCost = 10;

// Copper Variables
let copperOre = 0;
let copperMiners = 0;
let copperMinerCost = 10;

// Manufactured Variables
let ironPlates = 0;
let ironSmelters = 0;
let smelterCost = 20; // Costs raw iron to build for now

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

// --- 1. MANUAL MINING BUTTONS ---
mineIronBtn.addEventListener("click", () => {
    ironOre += 1;
    updateUI();
});

mineCopperBtn.addEventListener("click", () => {
    copperOre += 1;
    updateUI();
});

// --- 2. BUYING MACHINES ---
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

// --- 3. THE AUTOMATION LOOP (The Engine) ---
setInterval(() => {
    // 1. Miners produce raw ore
    if (ironMiners > 0) ironOre += ironMiners;
    if (copperMiners > 0) copperOre += copperMiners;

    // 2. Smelters consume Iron Ore to make Iron Plates
    if (ironSmelters > 0) {
        // We can only smelt what we have! If you have 5 smelters but only 2 iron ore, 
        // you only get 2 plates. Math.min finds the smaller of the two numbers.
        let amountToSmelt = Math.min(ironOre, ironSmelters);

        ironOre -= amountToSmelt;     // Burn the raw ore
        ironPlates += amountToSmelt;  // Create the plates
    }

    updateUI();
}, 1000);

// --- 4. UPDATE THE SCREEN ---
function updateUI() {
    // Update Iron
    ironCountDisplay.innerText = ironOre;
    ironMinerCountDisplay.innerText = ironMiners;
    ironMinerCostDisplay.innerText = ironMinerCost;

    // Update Copper
    copperCountDisplay.innerText = copperOre;
    copperMinerCountDisplay.innerText = copperMiners;
    copperMinerCostDisplay.innerText = copperMinerCost;

    // Update Plates & Smelters
    ironPlateCountDisplay.innerText = ironPlates;
    smelterCountDisplay.innerText = ironSmelters;
    smelterCostDisplay.innerText = smelterCost;
}

// --- 5. THEME TOGGLE LOGIC ---
const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;

// Check saved preference on load
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    themeToggleBtn.innerText = "☀️ Light Mode";
}

// Toggle button click
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