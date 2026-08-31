// Game variables
let ironOre = 0;

// Grab the HTML elements we need to update
const ironCountDisplay = document.getElementById("iron-count");
const mineIronBtn = document.getElementById("mine-iron-btn");

// What happens when you click the button
mineIronBtn.addEventListener("click", () => {
    ironOre += 1;
    updateUI();
});

// Function to keep the screen updated with the current numbers
function updateUI() {
    ironCountDisplay.innerText = ironOre;
}