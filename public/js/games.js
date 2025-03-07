// Waits until the entire page is loaded and ready
addEventListener("DOMContentLoaded", () => {
  
    // Grabs the iframe element where games will be displayed
    const gameFrame = document.getElementById("gameFrame");
  
    // Function that sets the 'src' of the iframe based on the game name
    function loadGame(game) {
      if (game === "hiragana") {
        gameFrame.src = "games/hiraganaGame.html"; 
      } else if (game === "katakana") {
        gameFrame.src = "games/katakanaGame.html";  
      } else {
        gameFrame.src = "";
      }
    }
  
    // Attaches click listeners to two "game-box" elements:
    // the first loads the Hiragana game, and the second loads the Katakana game
    document.querySelector(".game-box:nth-child(1)").addEventListener("click", () => loadGame("hiragana"));
    document.querySelector(".game-box:nth-child(2)").addEventListener("click", () => loadGame("katakana"));
  });
  