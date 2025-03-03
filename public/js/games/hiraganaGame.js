// js/games/hiraganaGame.js

class HiraganaGame {
    constructor() {
        this.HIRAGANA = [
            "あ", "い", "う", "え", "お",
            "か", "き", "く", "け", "こ",
            "さ", "し", "す", "せ", "そ",
            "た", "ち", "つ", "て", "と",
            "な", "に", "ぬ", "ね", "の",
            "は", "ひ", "ふ", "へ", "ほ",
            "ま", "み", "む", "め", "も",
            "や", "ゆ", "よ",
            "ら", "り", "る", "れ", "ろ",
            "わ", "を", "ん"
        ];
        this.selectedDifficulty = "easy";
        this.availableChars = [...this.HIRAGANA];
        this.placedChars = {};
        this.mistakes = 0;
        this.startTime = null;
        this.timer = null;
        this.timeLimit = 75; // 1:15 for Sensei mode
        this.initializeGame();
    }

    initializeGame() {
        const gameArea = document.getElementById("gameArea");

        gameArea.innerHTML = `
            <div id="game-container">
                <div id="difficulty-selector">
                    <button data-difficulty="easy">Easy</button>
                    <button data-difficulty="medium">Medium</button>
                    <button data-difficulty="hard">Hard</button>
                    <button data-difficulty="sensei">Sensei</button>
                </div>
                <div id="hiragana-table"></div>
                <div id="char-inventory"></div>
                <div id="game-footer"><p id="timer-display">Time: 0s</p></div>
            </div>
        `;

        document.querySelectorAll("#difficulty-selector button").forEach(button => {
            button.onclick = () => this.startGame(button.dataset.difficulty);
        });

        this.startGame("easy");
    }

    startGame(difficulty) {
        this.selectedDifficulty = difficulty;
        this.availableChars = [...this.HIRAGANA];
        this.placedChars = {};
        this.mistakes = 0;
        this.startTime = Date.now();
        if (this.timer) clearInterval(this.timer);

        const timerDisplay = document.getElementById("timer-display");
        this.timer = setInterval(() => {
            let elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

            if (this.selectedDifficulty === "sensei") {
                elapsedTime = this.timeLimit - elapsedTime;
                if (elapsedTime <= 0) {
                    clearInterval(this.timer);
                    alert("Time's up! You failed the challenge.");
                    return;
                }
            }

            timerDisplay.innerText = `Time: ${elapsedTime}s`;
        }, 1000);

        this.createTable();
        this.initializeCharacters();
    }

    createTable() {
        const table = document.getElementById("hiragana-table");
        table.innerHTML = "";
        for (let i = 0; i < this.HIRAGANA.length; i++) {
            let cell = document.createElement("div");
            cell.classList.add("table-cell");
            cell.dataset.index = i;
            cell.onclick = () => this.removeCharacter(cell);
            table.appendChild(cell);
        }
    }

    initializeCharacters() {
        const inventory = document.getElementById("char-inventory");
        inventory.innerHTML = "";
        let fillAmount = this.selectedDifficulty === "hard" || this.selectedDifficulty === "sensei" ? 0 : 20;
        let fillIndexes = new Set();

        while (fillIndexes.size < Math.floor(this.HIRAGANA.length * fillAmount / 100)) {
            fillIndexes.add(Math.floor(Math.random() * this.HIRAGANA.length));
        }

        for (let index of fillIndexes) {
            let cell = document.querySelector(`.table-cell[data-index="${index}"]`);
            cell.innerText = this.HIRAGANA[index];
            this.placedChars[index] = this.HIRAGANA[index];
            this.availableChars = this.availableChars.filter(char => char !== this.HIRAGANA[index]);
        }

        if (this.selectedDifficulty === "easy") {
            for (let char of this.availableChars) {
                let button = document.createElement("button");
                button.innerText = char;
                button.classList.add("char-button");
                button.onclick = () => this.selectCharacter(char);
                inventory.appendChild(button);
            }
        } else {
            this.provideNextCharacter();
        }
    }

    selectCharacter(char) {
        let selectedCell = document.querySelector(".table-cell.selected");
        if (selectedCell) {
            selectedCell.innerText = char;
            this.placedChars[selectedCell.dataset.index] = char;
            document.querySelector(`button:contains('${char}')`).remove();
            selectedCell.classList.remove("selected");
        }
    }

    removeCharacter(cell) {
        if (this.placedChars[cell.dataset.index]) {
            let char = this.placedChars[cell.dataset.index];
            delete this.placedChars[cell.dataset.index];
            cell.innerText = "";
            let button = document.createElement("button");
            button.innerText = char;
            button.classList.add("char-button");
            button.onclick = () => this.selectCharacter(char);
            document.getElementById("char-inventory").appendChild(button);
        }
    }

    provideNextCharacter() {
        if (this.availableChars.length === 0) {
            clearInterval(this.timer);
            alert(`You completed the table in ${document.getElementById("timer-display").innerText}!`);
            return;
        }

        let char = this.availableChars.pop();
        let prompt = document.createElement("p");
        prompt.innerText = `Place: ${char}`;
        document.getElementById("char-inventory").innerHTML = "";
        document.getElementById("char-inventory").appendChild(prompt);

        document.querySelectorAll(".table-cell").forEach(cell => {
            cell.onclick = () => this.checkPlacement(cell, char);
        });
    }

    checkPlacement(cell, char) {
        if (this.HIRAGANA[cell.dataset.index] === char) {
            cell.innerText = char;
            this.placedChars[cell.dataset.index] = char;

            if (this.selectedDifficulty === "sensei") {
                this.timeLimit += 5; // Sensei mode bonus
            }

            this.provideNextCharacter();
        } else {
            this.mistakes++;

            if (this.selectedDifficulty === "sensei") {
                this.timeLimit -= 5;
            } else if (this.selectedDifficulty === "hard") {
                this.addTime(5);
            } else {
                this.addTime(2);
            }

            cell.classList.add("error");
            setTimeout(() => cell.classList.remove("error"), 500);
        }
    }

    addTime(seconds) {
        this.startTime -= seconds * 1000;
    }
}

// Initialize when loaded
new HiraganaGame();
