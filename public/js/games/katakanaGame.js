/* 

The code is identical to hiragana table js

So you dont need to to read this file

quite litteraly copy-paste

*/

(function () {
    if (window.hiraganaGameLoaded) return;
    window.hiraganaGameLoaded = true;

    document.addEventListener("DOMContentLoaded", () => {
        startHiraganaGame();
    });

    const katakanaTable = [
        ["ワ", "ラ", "ヤ", "マ", "ハ", "ナ", "タ", "サ", "カ", "ア"],
        ["", "リ", "", "ミ", "ヒ", "ニ", "チ", "シ", "キ", "イ"],
        ["ヲ", "ル", "ヨ", "ム", "フ", "ヌ", "ツ", "ス", "ク", "ウ"],
        ["", "レ", "", "メ", "ヘ", "ネ", "テ", "セ", "ケ", "エ"],
        ["ン", "ロ", "ヨ", "モ", "ホ", "ノ", "ト", "ソ", "コ", "オ"]
    ];
    

    let selectedDifficulty, startTime, gameInterval, availableChars = [], selectedChar, mistakeCount, timer;

    function startHiraganaGame() {
        document.getElementById("gameArea").innerHTML = `
            <div class="game-menu">
                <h2>Katakana Table Fill</h2>
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

    function howToPlay() {
        document.getElementById("gameArea").innerHTML = `
            <div class="how-to-play">
                <h2>How to Play</h2>
                <p>Fill the correct katakana characters into the table.</p>
                <p><strong>Easy:</strong> 20% is pre-filled. Select characters and place them.</p>
                <p><strong>Medium:</strong> 20% is pre-filled. You must place the active character.</p>
                <p><strong>Hard:</strong> The board is empty. You must place the active character.</p>
                <p><strong>Sensei:</strong> Same as Hard, but you have 1:15 minutes. Mistakes remove 5 seconds.</p>
                <button onclick="startHiraganaGame()">Back to Menu</button>
            </div>
        `;
    }

    function startGame(difficulty) {
        selectedDifficulty = difficulty;
        availableChars = [];
        mistakeCount = 0;
        selectedChar = null;
        timer = difficulty === "sensei" ? 75 : 0;

        document.getElementById("gameArea").innerHTML = `
            <div class="game-board">
                <div id="gameTimer">Time: ${formatTime(timer)}</div>
                <div id="activeCharacter" style="display: ${difficulty === "easy" ? "none" : "block"};"></div>
                <div class="hiragana-table" id="katakanaTable"></div>
                <div class="character-pool" id="characterPool"></div>
            </div>
            <button class="quit-btn" onclick="returnToMainMenu()">Quit</button>
        `;

        generateHiraganaTable(difficulty);

        if (difficulty === "easy") {
            setTimeout(generateCharacterPool, 10);
        } else {
            setTimeout(setNextActiveCharacter, 10);
        }

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

    function generateHiraganaTable(difficulty) {
        const table = document.getElementById("katakanaTable");
        table.innerHTML = "";
        let filledSpots = 0;

        for (let i = 0; i < katakanaTable.length; i++) {
            for (let j = 0; j < katakanaTable[i].length; j++) {
                const char = katakanaTable[i][j];
                const cell = document.createElement("div");
                cell.classList.add("hiragana-cell");
                cell.dataset.index = `${i}-${j}`;

                if (char !== "") {
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
                    cell.addEventListener("click", () => placeCharacter(cell));
                }
                table.appendChild(cell);
            }
        }

        if (difficulty === "easy") ensureEnoughCharacters();
    }

    function ensureEnoughCharacters() {
        const missingChars = [];
        document.querySelectorAll(".hiragana-cell:not(.fixed-cell)").forEach(cell => {
            const [i, j] = cell.dataset.index.split("-").map(Number);
            if (!cell.textContent) {
                missingChars.push(katakanaTable[i][j]);
            }
        });
    
        availableChars = missingChars.filter(char => !placedCharacters.has(char)); 
        generateCharacterPool();
    }
    


    let initialShuffledChars = [];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }


    function generateCharacterPool() {
        const pool = document.getElementById("characterPool");
        pool.innerHTML = "";

        if (selectedDifficulty === "easy") {
            if (initialShuffledChars.length === 0) {
                initialShuffledChars = [...availableChars];
                shuffleArray(initialShuffledChars);
            }
            availableChars = initialShuffledChars.filter(char => !placedCharacters.has(char)); 
        } else {
            shuffleArray(availableChars);
        }

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

    function setNextActiveCharacter() {
        if (availableChars.length === 0) {
            endGame("success");
            return;
        }
    
        const activeCharElement = document.getElementById("activeCharacter");
        if (!activeCharElement) return;
    
        const randomIndex = Math.floor(Math.random() * availableChars.length);
        selectedChar = availableChars.splice(randomIndex, 1)[0];
    
        activeCharElement.textContent = `Active Character: ${selectedChar}`;
    }
    

    function placeCharacter(cell) {
        if (!selectedChar || cell.textContent) return;

        const [i, j] = cell.dataset.index.split("-").map(Number);
        const correctChar = katakanaTable[i][j];
        const table = document.getElementById("katakanaTable");

        if (selectedChar === correctChar) {
            cell.textContent = correctChar;
            table.classList.add("table-correct");
            setTimeout(() => table.classList.remove("table-correct"), 100);
            if (selectedDifficulty === "easy") removeCharacterFromInventory(selectedChar);
            setTimeout(checkCompletion, 100);
            if (selectedDifficulty !== "easy") setTimeout(setNextActiveCharacter, 200);
        } else {
            table.classList.add("table-wrong");
            setTimeout(() => table.classList.remove("table-wrong"), 500);
        }
    }

    let placedCharacters = new Set();

    function removeCharacterFromInventory(char) {
        placedCharacters.add(char); 
        generateCharacterPool(); 
    }


    function checkCompletion() {
        const totalCells = document.querySelectorAll(".hiragana-cell:not(.fixed-cell)").length;
        const filledCells = document.querySelectorAll(".hiragana-cell:not(:empty)").length;
        if (filledCells === totalCells) endGame("success");
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }

    function updateTimer() {
        document.getElementById("gameTimer").textContent = `Time: ${formatTime(timer)}`;
    }

    function endGame(result) {
        clearInterval(gameInterval);
    
        const finalBoardHTML = document.getElementById("katakanaTable").outerHTML;
    
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
    
        const gameArea = document.getElementById("gameArea");
        gameArea.innerHTML = ""; 
    
        startHiraganaGame();
    }
    

    function quitGame() {
        window.parent.document.getElementById("gameFrame").src = "";
    }

    window.startHiraganaGame = startHiraganaGame;
    window.startGame = startGame;
    window.howToPlay = howToPlay;
    window.returnToMainMenu = returnToMainMenu;
    window.quitGame = quitGame;

})();
