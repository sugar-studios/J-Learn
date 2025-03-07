// This Immediately Invoked Function Expression (IIFE) ensures everything is scoped and only loads once
(function () {
    // Prevents reinitialization if the script is already loaded
    if (window.hiraganaGameLoaded) return;
    window.hiraganaGameLoaded = true;

    // Once the DOM is ready, launch the hiragana game setup
    document.addEventListener("DOMContentLoaded", () => {
        startHiraganaGame();
    });

    // Hiragana table containing all characters in their positions
    const hiraganaTable = [
        ["わ", "ら", "や", "ま", "は", "な", "た", "さ", "か", "あ"],
        ["",   "り", "",   "み", "ひ", "に", "ち", "し", "き", "い"],
        ["を", "る", "ゆ", "む", "ふ", "ぬ", "つ", "す", "く", "う"],
        ["",   "れ", "",   "め", "へ", "ね", "て", "せ", "け", "え"],
        ["ん", "ろ", "よ", "も", "ほ", "の", "と", "そ", "こ", "お"]
    ];

    // Key variables that track game status (time, difficulty, etc.)
    let selectedDifficulty, startTime, gameInterval, availableChars = [];
    let selectedChar, mistakeCount, timer;

    // Shows the main menu where the user chooses difficulty or reads instructions
    function startHiraganaGame() {
        document.getElementById("gameArea").innerHTML = `
            <div class="game-menu">
                <h2>Hiragana Table Fill</h2>
                <p>Select Difficulty</p>
                <button onclick="startGame('easy')">Easy</button>
                <button onclick="startGame('medium')">Medium</button>
                <button onclick="startGame('hard')">Hard</button>
                <button onclick="startGame('sensei')">Sensei</button>
                <button onclick="howToPlay()">How to Play</button>
                <button onclick="quitGame()">Quit</button>
            </div>
        `;
    }

    // Displays a brief explanation of how the game works
    function howToPlay() {
        document.getElementById("gameArea").innerHTML = `
            <div class="how-to-play">
                <h2>How to Play</h2>
                <p>Fill the correct hiragana characters into the table.</p>
                <p><strong>Easy:</strong> 20% is pre-filled. Select characters and place them.</p>
                <p><strong>Medium:</strong> 20% is pre-filled. You must place the active character.</p>
                <p><strong>Hard:</strong> The board is empty. You must place the active character.</p>
                <p><strong>Sensei:</strong> Same as Hard, but you have 1:15 minutes. Mistakes remove 5 seconds.</p>
                <button onclick="startHiraganaGame()">Back to Menu</button>
            </div>
        `;
    }

    /*
     * Initializes a new game board based on chosen difficulty.
     * Creates the board, sets up timers, and readies either a pool of characters or an active character system.
     */
    function startGame(difficulty) {
        selectedDifficulty = difficulty;
        availableChars = [];
        mistakeCount = 0;
        selectedChar = null;
        timer = (difficulty === "sensei") ? 75 : 0;

        // Build the game area (board, timer, character elements)
        document.getElementById("gameArea").innerHTML = `
            <div class="game-board">
                <div id="gameTimer">Time: ${formatTime(timer)}</div>
                <div id="activeCharacter" style="display: ${difficulty === "easy" ? "none" : "block"};"></div>
                <div class="hiragana-table" id="hiraganaTable"></div>
                <div class="character-pool" id="characterPool"></div>
            </div>
            <button class="quit-btn" onclick="returnToMainMenu()">Quit</button>
        `;

        // Generate board with partial or no pre-filling, depending on difficulty
        generateHiraganaTable(difficulty);

        // Easy mode uses a pool; other modes pick an "active" character to place
        if (difficulty === "easy") {
            setTimeout(generateCharacterPool, 10);
        } else {
            setTimeout(setNextActiveCharacter, 10);
        }

        // Start timers: either countdown (sensei) or accumulate time (others)
        startTime = Date.now();
        updateTimer();

        gameInterval = setInterval(() => {
            if (difficulty === "sensei") {
                timer--;
                updateTimer();
                if (timer <= 0) {
                    endGame("fail");
                }
            } else {
                timer = Math.floor((Date.now() - startTime) / 1000);
                updateTimer();
            }
        }, 1000);
    }

    // Creates the 5x10 board and decides how many characters to pre-fill
    function generateHiraganaTable(difficulty) {
        const table = document.getElementById("hiraganaTable");
        table.innerHTML = "";
        let filledSpots = 0;

        for (let i = 0; i < hiraganaTable.length; i++) {
            for (let j = 0; j < hiraganaTable[i].length; j++) {
                const char = hiraganaTable[i][j];
                const cell = document.createElement("div");
                cell.classList.add("hiragana-cell");
                cell.dataset.index = `${i}-${j}`;

                // If there's a character in that slot (some are blank in the table)
                if (char !== "") {
                    // For easy/medium, randomly prefill about 20% of the cells
                    if (difficulty === "easy" || difficulty === "medium") {
                        if (Math.random() < 0.2 && filledSpots < 10) {
                            cell.textContent = char;
                            cell.classList.add("fixed-cell");
                            filledSpots++;
                        } else {
                            availableChars.push(char);
                        }
                    } else {
                        availableChars.push(char);
                    }
                    // Each cell is clickable to place a character
                    cell.addEventListener("click", () => placeCharacter(cell));
                }
                table.appendChild(cell);
            }
        }
        // For "easy" mode, ensure we correctly track and replenish missing characters
        if (difficulty === "easy") ensureEnoughCharacters();
    }

    /*
     * In "easy" mode, we want to keep track of which characters are needed 
     * (in case some are missing after random prefill).
     */
    function ensureEnoughCharacters() {
        const missingChars = [];
        document.querySelectorAll(".hiragana-cell:not(.fixed-cell)").forEach(cell => {
            const [i, j] = cell.dataset.index.split("-").map(Number);
            if (!cell.textContent) {
                missingChars.push(hiraganaTable[i][j]);
            }
        });
        // Filter out characters already placed so we don't duplicate
        availableChars = missingChars.filter(char => !placedCharacters.has(char)); 
        generateCharacterPool();
    }

    // Utility to shuffle the array of characters (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    let initialShuffledChars = [];

    /*
     * In "easy" mode we keep a static shuffle once to avoid re-randomizing 
     * every time we place or remove a character. 
     * Otherwise, we shuffle the pool on each generation.
     */
    function generateCharacterPool() {
        const pool = document.getElementById("characterPool");
        pool.innerHTML = "";

        if (selectedDifficulty === "easy") {
            // If we haven't shuffled yet, do it once and store
            if (initialShuffledChars.length === 0) {
                initialShuffledChars = [...availableChars];
                shuffleArray(initialShuffledChars);
            }
            // availableChars is updated whenever we place one
            availableChars = initialShuffledChars.filter(char => !placedCharacters.has(char));
        } else {
            shuffleArray(availableChars);
        }

        // Create a button for each character in the pool
        availableChars.forEach(char => {
            const charBtn = document.createElement("button");
            charBtn.classList.add("char-btn");
            charBtn.textContent = char;
            // Click to "select" that character (so you can place it in the grid)
            charBtn.addEventListener("click", () => selectCharacter(char, charBtn));
            pool.appendChild(charBtn);
        });
    }

    // Highlights the chosen character button, and stores it as 'selectedChar'
    function selectCharacter(char, btn) {
        document.querySelectorAll(".char-btn").forEach(btn => btn.classList.remove("selected"));
        selectedChar = char;
        btn.classList.add("selected");
    }

    /*
     * For difficulties other than "easy," we only have one active character at a time.
     * After placing it, we pick another from the pool randomly.
     */
    function setNextActiveCharacter() {
        if (availableChars.length === 0) {
            endGame("success");
            return;
        }
        const activeCharElement = document.getElementById("activeCharacter");
        if (!activeCharElement) return;

        // Randomly pick and remove a character from the array
        const randomIndex = Math.floor(Math.random() * availableChars.length);
        selectedChar = availableChars.splice(randomIndex, 1)[0];
        activeCharElement.textContent = `Active Character: ${selectedChar}`;
    }

    // Handles a cell click: if the user has a character selected, checks correctness.
    function placeCharacter(cell) {
        if (!selectedChar || cell.textContent) return;

        const [i, j] = cell.dataset.index.split("-").map(Number);
        const correctChar = hiraganaTable[i][j];
        const table = document.getElementById("hiraganaTable");

        // If correct, fill the cell, show green flash, update inventory/pool if easy
        if (selectedChar === correctChar) {
            cell.textContent = correctChar;
            table.classList.add("table-correct");
            setTimeout(() => table.classList.remove("table-correct"), 100);

            if (selectedDifficulty === "easy") {
                removeCharacterFromInventory(selectedChar);
            }
            setTimeout(checkCompletion, 100);

            // For medium, hard, sensei: pick the next character after a short delay
            if (selectedDifficulty !== "easy") {
                setTimeout(setNextActiveCharacter, 200);
            }
        } else {
            // Flash red if user places the wrong character
            table.classList.add("table-wrong");
            setTimeout(() => table.classList.remove("table-wrong"), 500);
            // In "sensei" mode, you might reduce time, but that's not implemented here
        }
    }

    // For "easy" mode, we remove the just-placed character from the pool
    let placedCharacters = new Set();
    function removeCharacterFromInventory(char) {
        placedCharacters.add(char);
        generateCharacterPool(); 
    }

    // Check if all non-fixed cells are filled to declare victory
    function checkCompletion() {
        const totalCells = document.querySelectorAll(".hiragana-cell:not(.fixed-cell)").length;
        const filledCells = document.querySelectorAll(".hiragana-cell:not(:empty)").length;
        if (filledCells === totalCells) {
            endGame("success");
        }
    }

    // Utility for formatting time (mm:ss)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }

    // Updates the on-screen timer text
    function updateTimer() {
        document.getElementById("gameTimer").textContent = `Time: ${formatTime(timer)}`;
    }

    /*
     * Called when the game ends: either user completed the board or time is up in sensei mode.
     * Shows results and final board, plus options to replay or return to menu.
     */
    function endGame(result) {
        clearInterval(gameInterval);

        const finalBoardHTML = document.getElementById("hiraganaTable").outerHTML;

        document.getElementById("gameArea").innerHTML = `
            <div class="game-results">
                <h2>${result === "fail" ? "Time's up! You failed." : "Game Complete!"}</h2>
                <div class="final-board">
                    <h3>Final Board</h3>
                    ${finalBoardHTML}
                </div>
                <button onclick="startGame('${selectedDifficulty}')">Play Again</button>
                <button onclick="returnToMainMenu()">Main Menu</button>
                <button onclick="quitGame()">Quit</button>
            </div>
        `;
    }

    // Takes the user back to the main menu screen; clears any running interval or variables
    function returnToMainMenu() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        selectedDifficulty = null;
        availableChars = [];
        selectedChar = null;
        mistakeCount = 0;
        timer = 0;

        document.getElementById("gameArea").innerHTML = "";
        startHiraganaGame();
    }

    // Closes the iframe from the parent document, effectively ending the game session
    function quitGame() {
        window.parent.document.getElementById("gameFrame").src = "";
    }

    // Expose key functions globally so the HTML buttons can call them
    window.startHiraganaGame = startHiraganaGame;
    window.startGame = startGame;
    window.howToPlay = howToPlay;
    window.returnToMainMenu = returnToMainMenu;
    window.quitGame = quitGame;

})();
