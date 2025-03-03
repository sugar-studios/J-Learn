let selectedMode = null;
let startTime;
let timerInterval;
let selectedLetter = null;

function startKanaGame(characters, gameTitle) {
    document.getElementById("gameArea").innerHTML = `
        <div id="kana-game-container">
            <h2>${gameTitle}</h2>
            <div class="mode-selection">
                <button onclick="startGame('${gameTitle}', characters, 'easy')">Easy</button>
                <button onclick="startGame('${gameTitle}', characters, 'medium')">Medium</button>
                <button onclick="startGame('${gameTitle}', characters, 'hard')">Hard</button>
                <button onclick="startGame('${gameTitle}', characters, 'sensei')">Sensei</button>
            </div>
            <div id="game-end"></div>
        </div>
    `;
}

function startGame(gameTitle, characters, mode) {
    selectedMode = mode;
    startTime = new Date();
    document.getElementById("game-end").innerHTML = `
        <div id="timer">Time: 0s</div>
        <div class="kana-grid" id="grid"></div>
        <div class="kana-choices" id="choices"></div>
    `;

    if (mode === "sensei") {
        timerInterval = setInterval(() => {
            let elapsed = Math.floor((new Date() - startTime) / 1000);
            document.getElementById("timer").innerText = `Time: ${elapsed}s`;
            if (elapsed >= 75) endGame(false);
        }, 1000);
    } else {
        timerInterval = setInterval(() => {
            let elapsed = Math.floor((new Date() - startTime) / 1000);
            document.getElementById("timer").innerText = `Time: ${elapsed}s`;
        }, 1000);
    }

    generateGrid(characters);
    if (mode === "easy") generateChoices(characters);
}

function generateGrid(characters) {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    
    characters.forEach((char, index) => {
        const cell = document.createElement("div");
        cell.classList.add("kana-cell");
        cell.dataset.index = index;
        if (char === "") {
            cell.style.visibility = "hidden";
        } else {
            if (selectedMode !== "hard" && Math.random() < 0.2) {
                cell.textContent = char;
                cell.classList.add("filled");
            } else {
                cell.onclick = () => selectCell(cell);
            }
        }
        grid.appendChild(cell);
    });
}

function generateChoices(characters) {
    const choices = document.getElementById("choices");
    choices.innerHTML = "";
    
    characters.filter(char => char !== "").forEach(char => {
        const choice = document.createElement("div");
        choice.classList.add("choice");
        choice.textContent = char;
        choice.onclick = () => selectLetter(choice);
        choices.appendChild(choice);
    });
}

function selectLetter(choice) {
    selectedLetter = choice.textContent;
    document.querySelectorAll(".choice").forEach(c => c.classList.remove("selected"));
    choice.classList.add("selected");
}

function selectCell(cell) {
    if (!selectedLetter || cell.classList.contains("filled")) return;
    
    cell.textContent = selectedLetter;
    cell.classList.add("filled");
    
    if (document.querySelectorAll(".kana-cell:not(.filled)").length === 0) {
        endGame(true);
    }
}

function endGame(success) {
    clearInterval(timerInterval);
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    
    document.getElementById("game-end").innerHTML = `
        <h3>${success ? "Game Complete!" : "Game Over!"}</h3>
        <p>Time: ${success ? elapsed + "s" : "Time Expired"}</p>
        <button onclick="startHiraganaGame()">Hiragana</button>
        <button onclick="startKatakanaGame()">Katakana</button>
    `;
}
