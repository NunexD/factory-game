// --- THEME TOGGLE LOGIC ---
const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;

// 1. Check if the user already saved a preference from last time
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    themeToggleBtn.innerText = "☀️ Light Mode";
}

// 2. What happens when you click the button
themeToggleBtn.addEventListener("click", () => {
    // This flips the dark mode on or off
    body.classList.toggle("dark-mode");

    // 3. Update the button text and save the choice
    if (body.classList.contains("dark-mode")) {
        themeToggleBtn.innerText = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggleBtn.innerText = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
    }
});