document.addEventListener("DOMContentLoaded", () => {
    const gameArea = document.getElementById("gameArea");

    const hiraganaTable = [
        ["わ", "ら", "や", "ま", "は", "な", "た", "さ", "か", "あ"],
        ["", "り", "", "み", "ひ", "に", "ち", "し", "き", "い"],
        ["を", "る", "ゆ", "む", "ふ", "ぬ", "つ", "す", "く", "う"],
        ["", "れ", "", "め", "へ", "ね", "て", "せ", "け", "え"],
        ["ん", "ろ", "よ", "も", "ほ", "の", "と", "そ", "こ", "お"]
    ];

    let selectedDifficulty, startTime, gameInterval, availableChars = [], selectedChar, mistakeCount, timer;

    function startHiraganaGame() {
        gameArea.innerHTML = `
            <div class="game-menu">
                <h2>Hiragana Table Fill</h2>
                <p>Select Difficulty</p>
                <button id="easy">Easy</button>
                <button id="medium">Medium</button>
                <button id="hard">Hard</button>
                <button id="sensei">Sensei</button>
                <button id="howToPlay">How to Play</button>
                <button id="quit">Quit</button>
            </div>
        `;

        document.getElementById("easy").addEventListener("click", () => startGame("easy"));
        document.getElementById("medium").addEventListener("click", () => startGame("medium"));
        document.getElementById("hard").addEventListener("click", () => startGame("hard"));
        document.getElementById("sensei").addEventListener("click", () => startGame("sensei"));
        document.getElementById("howToPlay").addEventListener("click", howToPlay);
        document.getElementById("quit").addEventListener("click", quitGame);
    }

    function howToPlay() {
        gameArea.innerHTML = `
            <div class="how-to-play">
                <h2>How to Play</h2>
                <p>Fill the correct hiragana characters into the table.</p>
                <p><strong>Easy:</strong> 20% is pre-filled. Select characters and place them.</p>
                <p><strong>Medium:</strong> 20% is pre-filled. You must place the active character.</p>
                <p><strong>Hard:</strong> The board is empty. You must place the active character.</p>
                <p><strong>Sensei:</strong> Same as Hard, but you have 1:15 minutes. Mistakes remove 5 seconds.</p>
                <button id="backToMenu">Back to Menu</button>
            </div>
        `;

        document.getElementById("backToMenu").addEventListener("click", startHiraganaGame);
    }

    function startGame(difficulty) {
        selectedDifficulty = difficulty;
        availableChars = [];
        mistakeCount = 0;
        selectedChar = null;

        gameArea.innerHTML = `
            <div class="game-board">
                <div id="gameTimer">Time: 00:00</div>
                <div id="activeCharacter">Active Character: -</div>
                <div class="hiragana-table" id="hiraganaTable"></div>
                <div class="character-pool" id="characterPool"></div>
            </div>
            <button id="quitBtn" class="quit-btn">Quit</button>
        `;

        document.getElementById("quitBtn").addEventListener("click", startHiraganaGame);

        generateHiraganaTable(difficulty);

        if (difficulty === "easy") {
            setTimeout(generateCharacterPool, 10);
        } else {
            setTimeout(setNextActiveCharacter, 10);
        }

        startTime = Date.now();
        updateTimer();

        if (difficulty === "sensei") {
            timer = 75;
            gameInterval = setInterval(() => {
                timer--;
                updateTimer();
                if (timer <= 0) {
                    endGame("fail");
                }
            }, 1000);
        } else {
            gameInterval = setInterval(updateTimer, 1000);
        }
    }

    function generateHiraganaTable(difficulty) {
        const table = document.getElementById("hiraganaTable");
        table.innerHTML = "";
        let filledSpots = 0;
        let totalCells = 50;

        for (let i = 0; i < hiraganaTable.length; i++) {
            for (let j = 0; j < hiraganaTable[i].length; j++) {
                const char = hiraganaTable[i][j];
                const cell = document.createElement("div");
                cell.classList.add("hiragana-cell");
                cell.dataset.index = `${i}-${j}`;

                if (char !== "") {
                    if (difficulty === "easy" || difficulty === "medium") {
                        if (Math.random() < 0.2 && filledSpots < totalCells * 0.2) {
                            cell.textContent = char;
                            cell.classList.add("fixed-cell");
                            filledSpots++;
                        } else {
                            availableChars.push(char);
                        }
                    } else {
                        availableChars.push(char);
                    }
                    cell.addEventListener("click", () => placeCharacter(cell));
                }
                table.appendChild(cell);
            }
        }
    }

    function generateCharacterPool() {
        const pool = document.getElementById("characterPool");
        pool.innerHTML = "";

        availableChars.forEach(char => {
            const charBtn = document.createElement("button");
            charBtn.classList.add("char-btn");
            charBtn.textContent = char;
            charBtn.addEventListener("click", () => selectCharacter(char, charBtn));
            pool.appendChild(charBtn);
        });
    }

    function selectCharacter(char, btn) {
        document.querySelectorAll(".char-btn").forEach(btn => btn.classList.remove("selected"));
        selectedChar = char;
        btn.classList.add("selected");
    }

    function checkCompletion() {
        const totalCells = document.querySelectorAll(".hiragana-cell").length;
        const filledCells = document.querySelectorAll(".hiragana-cell:not(:empty)").length;
    
        if (filledCells === totalCells) {
            endGame("success");
        }
    }
    

    function setNextActiveCharacter() {
        if (availableChars.length === 0) {
            document.getElementById("activeCharacter").textContent = "All characters placed!";
            return;
        }
    
        // ✅ Randomly select a new character
        const randomIndex = Math.floor(Math.random() * availableChars.length);
        selectedChar = availableChars.splice(randomIndex, 1)[0];
    
        // ✅ Update UI with the new active character
        document.getElementById("activeCharacter").textContent = `Active Character: ${selectedChar}`;
    }
    

    function placeCharacter(cell) {
        if (!selectedChar || cell.textContent) return; // Prevent placing over existing characters
    
        const [i, j] = cell.dataset.index.split("-").map(Number);
        const correctChar = hiraganaTable[i][j];
        const table = document.getElementById("hiraganaTable");
    
        if (selectedChar === correctChar) {
            // ✅ Correct placement
            cell.textContent = correctChar;
            table.classList.add("table-correct"); // Whole table flashes green
            setTimeout(() => table.classList.remove("table-correct"), 100);
    
            // ✅ Remove character from the inventory in easy mode
            if (selectedDifficulty === "easy") {
                removeCharacterFromInventory(selectedChar);
            }
    
            // ✅ Check if the game is complete
            setTimeout(checkCompletion, 100);
    
            // ✅ Update active character
            if (selectedDifficulty !== "easy") {
                setTimeout(setNextActiveCharacter, 200);
            }
        } else {
            // ❌ Incorrect placement
            table.classList.add("table-wrong"); // Whole table shakes red
            setTimeout(() => table.classList.remove("table-wrong"), 500);
    
            // ✅ Apply mistake penalty
            mistakeCount += (selectedDifficulty === "hard") ? 5 : 2;
            if (selectedDifficulty === "sensei") mistakeCount -= 5;
        }
    }        

    function removeCharacterFromInventory(char) {
        const charButtons = document.querySelectorAll(".char-btn");
        charButtons.forEach(btn => {
            if (btn.textContent === char) {
                btn.remove();
            }
        });
    }

    function updateTimer() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
        const seconds = String(elapsedTime % 60).padStart(2, '0');

        document.getElementById("gameTimer").textContent = `Time: ${minutes}:${seconds}`;
    }

    function quitGame() {
        gameArea.innerHTML = `<p>No game here</p>`;
    }

    startHiraganaGame();
});
