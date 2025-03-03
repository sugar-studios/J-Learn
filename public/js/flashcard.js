class FlashcardGame {
    constructor(selectedSet) {
        if (!selectedSet) return;

        this.selectedSet = selectedSet;
        this.modal = document.createElement("div");
        this.modal.id = "flashcard-modal";
        document.body.appendChild(this.modal);

        this.startTime = null;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.deck = [...selectedSet.cards];
        this.incorrectAttempts = new Map();
        this.longestRecall = { word: "", time: 0 };
        this.recallTimes = []; // Track individual recall times
        this.unfinishedCards = new Set();
        this.recallTime = Infinity;
        this.testDuration = Infinity;
        this.mode = "practice"; // Default mode
        this.testTimer = null;

        this.showModeSelection();
    }

    showModeSelection() {
        this.modal.innerHTML = `
            <button class="close-modal">❌</button>
            <h2>Select Mode</h2>
            <button id="practice-mode">Practice</button>
            <button id="test-mode">Test</button>
            <button id="go-back">Go Back</button>
        `;

        document.getElementById("practice-mode").addEventListener("click", () => this.startPracticeMode());
        document.getElementById("test-mode").addEventListener("click", () => this.setupTestMode());
        document.getElementById("go-back").addEventListener("click", () => this.modal.remove());
        this.modal.querySelector(".close-modal").addEventListener("click", () => this.modal.remove());
    }

    startPracticeMode() {
        this.mode = "practice";
        this.startTime = Date.now();
        this.currentCardIndex = 0;
        this.longestRecall = { word: "", time: 0 };
        this.recallTimes = [];
        this.showNextPracticeCard();
    }
    
    showNextPracticeCard() {
        if (this.currentCardIndex >= this.deck.length) {
            this.showPracticeStats();
            return;
        }
    
        let card = this.deck[this.currentCardIndex];
        this.timeKeyShown = Date.now(); // Start timing when card appears
        this.firstFlipTracked = false; // Ensure first flip is tracked
        this.showPracticeFlashcard(card);
    }
    
    showPracticeFlashcard(card) {
        this.modal.innerHTML = `
            <button class="close-modal">❌</button>
            <div id="flashcard-box" class="flashcard light-grey">${card.japanese}</div>
            <button id="view-key" style="display:none;">View Key Term</button>
        `;
    
        const flashcardBox = document.getElementById("flashcard-box");
        const viewKeyButton = document.getElementById("view-key");
        this.isFlipped = false;
    
        flashcardBox.addEventListener("click", () => {
            this.timeClicked = Date.now();
            let recallTimeTaken = (this.timeClicked - this.timeKeyShown) / 1000;
    
            if (!this.isFlipped) {
                // Track the first-time flip for recall stats
                if (!this.firstFlipTracked) {
                    this.recallTimes.push(recallTimeTaken);
                    this.firstFlipTracked = true;
                    
                    if (recallTimeTaken > this.longestRecall.time) {
                        this.longestRecall = { word: card.japanese, time: recallTimeTaken };
                    }
                }
    
                // Flip to value
                flashcardBox.textContent = card.english;
                flashcardBox.classList.replace("light-grey", "dark-grey");
                viewKeyButton.style.display = "block"; // Show key term button
                this.isFlipped = true;
            } else {
                // Move to next card when clicking while value is shown
                this.currentCardIndex++;
                this.showNextPracticeCard();
            }
        });
    
        viewKeyButton.addEventListener("click", () => {
            flashcardBox.textContent = card.japanese;
            flashcardBox.classList.replace("dark-grey", "light-grey");
            viewKeyButton.style.display = "none"; // Hide button again
            this.isFlipped = false;
        });
    
        this.modal.querySelector(".close-modal").addEventListener("click", () => {
            this.modal.remove();
        });
    }
    
    showPracticeStats() {
        let totalTime = (Date.now() - this.startTime) / 1000;
        let longestRecallText = this.longestRecall.word ? `${this.longestRecall.word} (${this.longestRecall.time.toFixed(2)} sec)` : "N/A";
    
        this.modal.innerHTML = `
            <button class="close-modal">❌</button>
            <h2>Practice Complete</h2>
            <p>Total Time: ${totalTime.toFixed(2)} seconds</p>
            <p>Longest Recall: ${longestRecallText}</p>
            <button id="change-mode">Change Mode</button>
            <button id="retry">Retry Practice</button>
            <button id="quit">Quit</button>
        `;
    
        document.getElementById("retry").addEventListener("click", () => this.startPracticeMode());
        document.getElementById("change-mode").addEventListener("click", () => this.showModeSelection());
        document.getElementById("quit").addEventListener("click", () => this.modal.remove());
    }
    

    setupTestMode() {
        this.modal.innerHTML = `
            <button class="close-modal">❌</button>
            <h2>Set Test Parameters</h2>
            <label>Recall Time (seconds):</label>
            <input type="number" id="recall-time" min="1">
            <label>Test Duration (seconds, blank for unlimited):</label>
            <input type="number" id="test-duration" min="1">
            <button id="start-test">Start Test</button>
        `;

        document.getElementById("start-test").addEventListener("click", () => {
            this.recallTime = parseFloat(document.getElementById("recall-time").value) || Infinity;
            this.testDuration = parseFloat(document.getElementById("test-duration").value) || Infinity;
            this.startTestMode();
        });

        this.modal.querySelector(".close-modal").addEventListener("click", () => this.modal.remove());
    }

    startTestMode() {
        this.mode = "test";
        this.startTime = Date.now();
        this.deck = [...this.selectedSet.cards];
        this.incorrectAttempts.clear();
        this.unfinishedCards.clear();
        this.longestRecall = { word: "", time: 0 };
        this.recallTimes = []; // Track individual recall times
        this.timeKeyShown = null;
        this.timeClicked = null;
        this.testTimer = null;
    
        if (this.testDuration !== Infinity) {
            this.testTimer = setTimeout(() => {
                console.log("Test timer expired. Ending test.");
                this.endTestDueToTimeout();
            }, this.testDuration * 1000);
        }
    
        this.showNextCard();
    }
    
    showNextCard() {
        console.log("Remaining deck:", this.deck.map(card => card.japanese));
    
        if (this.deck.length === 0) {
            console.log("Test finished. Showing stats.");
            this.showTestStats(false);
            return;
        }
    
        let card = this.deck.shift();
        this.currentCardStatus = "pending"; // Mark as unseen
        this.timeKeyShown = Date.now(); // Timestamp when key appears
        this.showFlashcard(card);
    }
    
    showFlashcard(card) {
        this.modal.innerHTML = `
            <button class="close-modal">❌</button>
            <div id="flashcard-box" class="flashcard light-grey">${card.japanese}</div>
        `;
    
        const flashcardBox = document.getElementById("flashcard-box");
        this.isFlipped = false;
    
        flashcardBox.addEventListener("click", () => {
            this.timeClicked = Date.now(); // Timestamp when clicked
            let recallTimeTaken = (this.timeClicked - this.timeKeyShown) / 1000; // Time taken to flip
    
            if (!this.isFlipped) {
                this.recallTimes.push(recallTimeTaken); // Store recall time
    
                if (this.mode === "test") {
                    if (recallTimeTaken > this.recallTime) {
                        this.deck.push(card); // Re-add if exceeded recall time
                        this.incorrectAttempts.set(card.japanese, (this.incorrectAttempts.get(card.japanese) || 0) + 1);
                    }
    
                    if (recallTimeTaken > this.longestRecall.time) {
                        this.longestRecall = { word: card.japanese, time: recallTimeTaken };
                    }
                }
    
                flashcardBox.classList.add("fade-out");
                setTimeout(() => {
                    flashcardBox.textContent = card.english;
                    flashcardBox.classList.replace("light-grey", "dark-grey");
                    flashcardBox.classList.remove("fade-out");
                    this.isFlipped = true;
                }, 500);
            } else {
                if (this.deck.length === 0) {
                    clearTimeout(this.testTimer);
                    this.showTestStats(false);
                } else {
                    this.showNextCard();
                }
            }
        });
    
        this.modal.querySelector(".close-modal").addEventListener("click", () => {
            clearTimeout(this.testTimer);
            this.modal.remove();
        });
    }
    
    
    endTestDueToTimeout() {
        console.log("Final deck before timeout handling:", this.deck.map(card => card.japanese));
    
        if (this.currentCardStatus === "pending") {
            this.unfinishedCards.add(this.deck[0].japanese); // If never flipped, mark unfinished
        }
    
        this.deck.forEach(card => {
            if (this.currentCardStatus === "flipped-late") {
                this.deck.push(card); // Re-add late-flipped cards
            } else {
                this.unfinishedCards.add(card.japanese); // Mark as unfinished
            }
        });
    
        console.log("Unfinished cards:", [...this.unfinishedCards]);
        this.showTestStats(true);
    }    

    showTestStats(timeoutExpired) {
        clearTimeout(this.testTimer);

        let totalTime = (Date.now() - this.startTime) / 1000;
        let attemptsData = [...this.incorrectAttempts].map(([word, attempts]) => `${word}: ${attempts} attempts`).join("<br>") || "None";
        let longestRecallText = this.longestRecall.word ? `${this.longestRecall.word} (${this.longestRecall.time.toFixed(2)} sec)` : "N/A";
        let unfinishedCardsText = timeoutExpired ? [...this.deck.map(card => card.japanese)].join(", ") || "None" : "N/A";
        let grade = this.calculateGrade();

        this.modal.innerHTML = `
            <button class="close-modal">❌</button>
            <h2>Test Complete</h2>
            <p>Total Time: ${totalTime.toFixed(2)} seconds</p>
            <p>Longest Recall: ${longestRecallText}</p>
            <p>Cards Needing Multiple Attempts:</p>
            <p>${attemptsData}</p>
            <p>Unfinished Cards: ${unfinishedCardsText}</p>
            <p>Grade: <strong>${grade}</strong></p>
            <button id="change-mode">Change Mode</button>
            <button id="retry">Retry Test</button>
            <button id="quit">Quit</button>
        `;

        this.modal.querySelector(".close-modal").addEventListener("click", () => this.modal.remove());
        document.getElementById("retry").addEventListener("click", () => this.startTestMode());
        document.getElementById("change-mode").addEventListener("click", () => this.showModeSelection());
        document.getElementById("quit").addEventListener("click", () => this.modal.remove());
    }

    calculateGrade() {
        if (this.recallTimes.length === 0) return "F"; // Prevent divide-by-zero errors
    
        let avgTime = this.recallTimes.reduce((a, b) => a + b, 0) / this.recallTimes.length;
        let avgRoundedDown = Math.floor(avgTime);
        let avgRoundedUp = Math.ceil(avgTime);
    
        let totalCards = this.selectedSet.cards.length;
        let incorrectCount = [...this.incorrectAttempts.values()].reduce((sum, attempts) => sum + attempts, 0);
        let uniqueIncorrectCards = this.incorrectAttempts.size;
    
        let allCompleted = this.recallTimes.length === totalCards;
        let noRetries = incorrectCount === 0;
        let fewRetries = uniqueIncorrectCards <= 2;
        let manyRetries = uniqueIncorrectCards >= 3;
    
        console.log("DEBUG: ", { avgTime, avgRoundedDown, avgRoundedUp, totalCards, incorrectCount, allCompleted });
    
        if (this.recallTime === Infinity) {
            console.warn("Warning: Recall time is Infinity. Grading might be incorrect.");
            this.recallTime = 5; // Default to 5s if not set
        }
    
        // **A RANKS**
        if (allCompleted && noRetries) {
            if (avgRoundedDown <= this.recallTime / 2) return "A+";
            if (avgRoundedUp === this.recallTime) return "A-";
            return "A";
        }
    
        // **B RANKS** (1-2 retries, but finished)
        if (allCompleted && fewRetries) {
            if (avgRoundedDown <= this.recallTime / 2) return "B+";
            if (avgRoundedUp === this.recallTime) return "B-";
            return "B";
        }
    
        // **C RANKS** (3+ retries, but finished)
        if (allCompleted && manyRetries) {
            if (avgRoundedDown <= this.recallTime / 2) return "C+";
            if (avgRoundedUp === this.recallTime) return "C-";
            return "C";
        }
    
        // **D RANK** (Test completed, but struggled a lot)
        if (allCompleted) return "D";
    
        // **F RANK** (Did not finish or had extreme struggles)
        return "F";
    }    
    
}

// Usage:
function startFlashcardSession(selectedSet) {
    new FlashcardGame(selectedSet);
}
