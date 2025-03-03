// js/games.js

const gameArea = document.getElementById("gameArea");

// Mapping game names to their respective scripts
const games = {
    "hiragana-game": "js/games/hiraganaGame.js",
    // Future games can be added here
};

// Function to load the selected game
function startGame(gameId) {
    gameArea.innerHTML = "<p>Loading...</p>"; // Temporary loading text

    const script = document.createElement("script");
    script.src = games[gameId];
    script.onload = () => {
        if (typeof initializeGame === "function") {
            initializeGame(); // Initialize the loaded game
        }
    };
    
    // Remove any previous script
    const oldScript = document.querySelector("#gameScript");
    if (oldScript) oldScript.remove();

    script.id = "gameScript";
    document.body.appendChild(script);
}

// Assign event listeners to game selection buttons
document.getElementById("hiragana-game").addEventListener("click", () => startGame("hiragana-game"));
