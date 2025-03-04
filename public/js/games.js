document.addEventListener("DOMContentLoaded", () => {
    const gameFrame = document.getElementById("gameFrame");

    function loadGame(game) {
        if (game === "hiragana") {
            gameFrame.src = "games/hiraganaGame.html";  // Load the Hiragana game
        } else if (game === "katakana") {
            gameFrame.src = "games/katakanaGame.html";  // Placeholder for Katakana game
        } else {
            gameFrame.src = "";
        }
    }

    // Assign event listeners to the game selection buttons
    document.querySelector(".game-box:nth-child(1)").addEventListener("click", () => loadGame("hiragana"));
    document.querySelector(".game-box:nth-child(2)").addEventListener("click", () => loadGame("katakana"));
});
