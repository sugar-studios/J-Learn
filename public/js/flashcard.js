// The FlashcardGame class defines all functionality for practicing or testing flashcards
class FlashcardGame {
    constructor(selectedSet) {
        // Avoid proceeding if no set is provided
        if (!selectedSet) return;

        // Store the set, build and attach a modal to the page
        this.selectedSet = selectedSet;
        this.modal = document.createElement("div");
        this.modal.id = "flashcard-modal";
        document.body.appendChild(this.modal);

        // Initialize timing, stats, and default mode
        this.startTime = null;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.deck = [...selectedSet.cards];
        this.incorrectAttempts = new Map();
        this.longestRecall = { word: "", time: 0 };
        this.recallTimes = [];
        this.unfinishedCards = new Set();
        this.recallTime = Infinity;
        this.testDuration = Infinity;
        this.mode = "practice"; 
        this.testTimer = null;

        // Prompt user to choose mode (practice or test) when starting
        this.showModeSelection();
    }

    // Shows a simple UI with buttons for choosing between practice or test mode
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

    // Begins the practice mode logic
    startPracticeMode() {
        this.mode = "practice";
        this.startTime = Date.now();
        this.currentCardIndex = 0;
        this.longestRecall = { word: "", time: 0 };
        this.recallTimes = [];
        this.showNextPracticeCard();
    }
    
    // Renders the next flashcard for practice mode
    showNextPracticeCard() {
        if (this.currentCardIndex >= this.deck.length) {
            this.showPracticeStats();
            return;
        }

        let card = this.deck[this.currentCardIndex];
        this.timeKeyShown = Date.now();
        this.firstFlipTracked = false; 
        this.showPracticeFlashcard(card);
    }

    // Creates a practice flashcard in the modal; flipping shows/hides the translation
    showPracticeFlashcard(card) {
        this.modal.innerHTML = `
            <button class="close-modal">❌</button>
            <div id="flashcard-box" class="flashcard light-grey">${card.japanese}</div>
            <button id="view-key" style="display:none;">View Key Term</button>
        `;

        const flashcardBox = document.getElementById("flashcard-box");
        const viewKeyButton = document.getElementById("view-key");
        this.isFlipped = false;

        // Click on the card toggles flip / tracks recall time
        flashcardBox.addEventListener("click", () => {
            this.timeClicked = Date.now();
            let recallTimeTaken = (this.timeClicked - this.timeKeyShown) / 1000;

            if (!this.isFlipped) {
                // Record the recall time on the first flip
                if (!this.firstFlipTracked) {
                    this.recallTimes.push(recallTimeTaken);
                    this.firstFlipTracked = true;

                    if (recallTimeTaken > this.longestRecall.time) {
                        this.longestRecall = { word: card.japanese, time: recallTimeTaken };
                    }
                }

                // Show English side
                flashcardBox.textContent = card.english;
                flashcardBox.classList.replace("light-grey", "dark-grey");
                viewKeyButton.style.display = "block";
                this.isFlipped = true;
            } else {
                // Move to next card if clicked again
                this.currentCardIndex++;
                this.showNextPracticeCard();
            }
        });

        // Optional button to revert to the Japanese side
        viewKeyButton.addEventListener("click", () => {
            flashcardBox.textContent = card.japanese;
            flashcardBox.classList.replace("dark-grey", "light-grey");
            viewKeyButton.style.display = "none";
            this.isFlipped = false;
        });

        // Close the modal entirely
        this.modal.querySelector(".close-modal").addEventListener("click", () => {
            this.modal.remove();
        });
    }

    // Shows practice summary statistics (total time, hardest word, etc.)
    showPracticeStats() {
        let totalTime = (Date.now() - this.startTime) / 1000;
        let longestRecallText = this.longestRecall.word
            ? `${this.longestRecall.word} (${this.longestRecall.time.toFixed(2)} sec)`
            : "N/A";

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

    // Displays a form to set up "Test Mode"
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

    // Begins the test mode logic (similar to practice but with time limits, retries, etc.)
    startTestMode() {
        this.mode = "test";
        this.startTime = Date.now();
        this.deck = [...this.selectedSet.cards];
        this.incorrectAttempts = new Map();
        this.unfinishedCards = new Set();
        this.longestRecall = { word: "", time: 0 };
        this.recallTimes = [];
        this.timeKeyShown = null;
        this.timeClicked = null;
        this.testTimer = null;

        // If user set a max duration, schedule a forced end
        if (this.testDuration !== Infinity) {
            this.testTimer = setTimeout(() => {
                console.log("Test timer expired. Ending test.");
                this.endTestDueToTimeout();
            }, this.testDuration * 1000);
        }

        this.showNextCard();
    }

    // Shows the next card in test mode
    showNextCard() {
        console.log("Remaining deck:", this.deck.map(card => card.japanese));

        if (this.deck.length === 0) {
            console.log("Test finished. Showing stats.");
            this.showTestStats(false);
            return;
        }

        let card = this.deck.shift();
        this.currentCardStatus = "pending";
        this.timeKeyShown = Date.now();
        this.showFlashcard(card);
    }

    // Renders the flashcard for test mode (with time checks and re-adding missed cards)
    showFlashcard(card) {
        this.modal.innerHTML = `
            <button class="close-modal">❌</button>
            <div id="flashcard-box" class="flashcard light-grey">${card.japanese}</div>
        `;

        const flashcardBox = document.getElementById("flashcard-box");
        this.isFlipped = false;

        flashcardBox.addEventListener("click", () => {
            this.timeClicked = Date.now();
            let recallTimeTaken = (this.timeClicked - this.timeKeyShown) / 1000;

            if (!this.isFlipped) {
                // Record the recall time for the first flip
                this.recallTimes.push(recallTimeTaken);

                if (this.mode === "test") {
                    // If they exceed the recall time, re-add to deck
                    if (recallTimeTaken > this.recallTime) {
                        this.deck.push(card);
                        this.incorrectAttempts.set(
                            card.japanese,
                            (this.incorrectAttempts.get(card.japanese) || 0) + 1
                        );
                    }
                    // Track the longest recall
                    if (recallTimeTaken > this.longestRecall.time) {
                        this.longestRecall = { word: card.japanese, time: recallTimeTaken };
                    }
                }

                // Animate the flip
                flashcardBox.classList.add("fade-out");
                setTimeout(() => {
                    flashcardBox.textContent = card.english;
                    flashcardBox.classList.replace("light-grey", "dark-grey");
                    flashcardBox.classList.remove("fade-out");
                    this.isFlipped = true;
                }, 500);
            } else {
                // Move on to next or show stats
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

    // Called when the test duration runs out
    endTestDueToTimeout() {
        console.log("Final deck before timeout handling:", this.deck.map(card => card.japanese));
        if (this.currentCardStatus === "pending") {
            this.unfinishedCards.add(this.deck[0].japanese);
        }

        this.deck.forEach(card => {
            // If some were flipped too late or not at all, handle them
            this.unfinishedCards.add(card.japanese);
        });

        console.log("Unfinished cards:", [...this.unfinishedCards]);
        this.showTestStats(true);
    }

    // Displays the test results (time, attempts, grade, etc.)
    showTestStats(timeoutExpired) {
        clearTimeout(this.testTimer);

        let totalTime = (Date.now() - this.startTime) / 1000;
        let attemptsData = [...this.incorrectAttempts]
            .map(([word, attempts]) => `${word}: ${attempts} attempts`)
            .join("<br>") || "None";
        let longestRecallText = this.longestRecall.word
            ? `${this.longestRecall.word} (${this.longestRecall.time.toFixed(2)} sec)`
            : "N/A";
        let unfinishedCardsText = timeoutExpired
            ? [...this.deck.map(card => card.japanese)].join(", ") || "None"
            : "N/A";
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

    // Basic grading logic comparing recall times and attempts
    calculateGrade() {
        if (this.recallTimes.length === 0) return "F"; 

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

        // If recallTime was never set, give a fallback (to avoid Infinity in calculations)
        if (this.recallTime === Infinity) {
            console.warn("Warning: Recall time is Infinity. Grading might be incorrect.");
            this.recallTime = 5; // A default fallback
        }

        // Simplified grading logic:
        if (allCompleted && noRetries) {
            if (avgRoundedDown <= this.recallTime / 2) return "A+";
            if (avgRoundedUp === this.recallTime) return "A-";
            return "A";
        }
        if (allCompleted && fewRetries) {
            if (avgRoundedDown <= this.recallTime / 2) return "B+";
            if (avgRoundedUp === this.recallTime) return "B-";
            return "B";
        }
        if (allCompleted && manyRetries) {
            if (avgRoundedDown <= this.recallTime / 2) return "C+";
            if (avgRoundedUp === this.recallTime) return "C-";
            return "C";
        }
        if (allCompleted) return "D";
        return "F";
    }
}

function startFlashcardSession(selectedSet) {
    new FlashcardGame(selectedSet);
}