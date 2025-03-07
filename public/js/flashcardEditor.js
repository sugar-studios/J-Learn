// The FlashcardEditor manages creation, editing, and importing/exporting of flashcard sets
class FlashcardEditor {
    constructor(storage) {
        // Accept a storage instance that will be used to save/load flashcard sets
        this.storage = storage;

        // Retrieve important DOM elements
        this.setNameInput = document.getElementById("set-name");
        this.addCardButton = document.getElementById("add-card");
        this.flashcardList = document.getElementById("flashcard-list");
        this.saveSetButton = document.getElementById("save-set");
        this.copyCodeButton = document.getElementById("copy-code");
        this.importCodeInput = document.getElementById("import-code");
        this.tagSelection = document.getElementById("tag-selection");

        // Local in-memory storage for flashcards (and which set we're editing)
        this.flashcards = [];
        this.editingIndex = null;

        // Run the initial setup
        this.initialize();
    }

    // Sets up event listeners and resets the editor UI
    initialize() {
        console.log("Initializing Flashcard Editor...");

        this.tagSelection.addEventListener("click", (event) => this.toggleTag(event));
        this.addCardButton.addEventListener("click", () => this.addFlashcard());
        this.saveSetButton.addEventListener("click", () => this.saveFlashcardSet());
        this.copyCodeButton.addEventListener("click", () => this.copyExportCode());
        this.importCodeInput.addEventListener("input", () => this.loadImportCode());

        this.resetEditor();
    }

    // Toggles the "selected" styling on tags when clicked
    toggleTag(event) {
        const tag = event.target;
        if (tag.tagName === "LABEL") {
            tag.classList.toggle("selected");
        }
    }

    // Adds a new flashcard (Japanese + English) to the local flashcards array
    addFlashcard() {
        const japaneseWord = document.querySelector(".japanese-word").value.trim();
        const englishWord = document.querySelector(".english-word").value.trim();

        if (japaneseWord && englishWord) {
            this.flashcards.push({ japanese: japaneseWord, english: englishWord });
            this.renderFlashcards();
        }
    }

    // Updates the DOM to show the current list of flashcards
    renderFlashcards() {
        this.flashcardList.innerHTML = "";
        this.flashcards.forEach((card, index) => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("flashcard-entry");
            cardElement.innerHTML = `
                ${card.japanese} - ${card.english}
                <button onclick="flashcardEditor.deleteFlashcard(${index})">❌</button>
            `;
            this.flashcardList.appendChild(cardElement);
        });
    }

    // Removes a flashcard from the local array, then re-renders
    deleteFlashcard(index) {
        this.flashcards.splice(index, 1);
        this.renderFlashcards();
    }

    // Saves the current flashcard set to storage
    saveFlashcardSet() {
        console.log("Saving flashcard set...");

        // If there's an import code present, try to decode and save that first
        const importCode = this.importCodeInput.value.trim();
        if (importCode) {
            const importedData = this.decodeFlashcardCode(importCode);
            if (importedData) {
                this.storage.saveFlashcardSet(importedData);
                flashcardManager.renderFlashcardSets();
                this.resetEditor();
                return;
            }
        }

        // Otherwise, save a new or existing set from the editor fields
        const setName = this.setNameInput.value.trim();
        if (!setName || this.flashcards.length === 0) {
            console.warn("Cannot save: Missing name or flashcards.");
            return;
        }

        // Collect all currently checked tags
        let selectedTags = [];
        document.querySelectorAll("#tag-selection input:checked").forEach(tag => {
            selectedTags.push(tag.value);
        });

        // Create the set object
        const newSet = { name: setName, tags: selectedTags, cards: this.flashcards };

        // If editingIndex is set, update that set; otherwise, create a new one
        if (this.editingIndex !== null) {
            this.storage.saveFlashcardSet(newSet, this.editingIndex);
            this.editingIndex = null;
        } else {
            this.storage.saveFlashcardSet(newSet);
        }

        // Refresh the manager's view and clear the editor
        flashcardManager.renderFlashcardSets();
        this.resetEditor();
    }

    // Called by the FlashcardManager to load a set for editing
    loadFlashcardSetForEditing(set, index) {
        console.log("Entering edit mode for:", set.name);
        this.editingIndex = index;
        this.setNameInput.value = set.name;
        this.flashcards = [...set.cards];

        // Check/uncheck relevant tags
        document.querySelectorAll("#tag-selection input").forEach(input => {
            input.checked = set.tags.includes(input.value);
        });

        this.renderFlashcards();
        this.toggleImportExportMode(true);
    }

    // Copies the currently editing set to the clipboard as a base64-encoded string
    copyExportCode() {
        const set = this.storage.getUserFlashcardSets()[this.editingIndex];
        if (!set) return;

        const exportCode = btoa(JSON.stringify(set));
        navigator.clipboard.writeText(exportCode);
        this.showSnackbar("Flashcard set copied!");
    }

    // Whenever the user types in the import code field, try to parse and load data
    loadImportCode() {
        try {
            const importedData = this.decodeFlashcardCode(this.importCodeInput.value);
            if (importedData) {
                this.setNameInput.value = importedData.name;
                this.flashcards = importedData.cards;
                this.renderFlashcards();
            }
        } catch {
            console.warn("Invalid import code.");
        }
    }

    // Attempts to decode a base64 string into a JavaScript object
    decodeFlashcardCode(code) {
        try {
            return JSON.parse(atob(code));
        } catch {
            return null;
        }
    }

    // Switches between import and export modes
    toggleImportExportMode(editing) {
        if (editing) {
            this.importCodeInput.style.display = "none";
            this.copyCodeButton.style.display = "block";
        } else {
            this.importCodeInput.style.display = "block";
            this.copyCodeButton.style.display = "none";
        }
    }

    // Resets the form inputs and flashcard list for creating a brand-new set
    resetEditor() {
        this.setNameInput.value = "";
        this.flashcards = [];
        this.renderFlashcards();
        this.toggleImportExportMode(false);
    }

    // Displays a temporary message box at the bottom of the screen
    showSnackbar(message) {
        const snackbar = document.createElement("div");
        snackbar.className = "snackbar";
        snackbar.innerText = message;
        document.body.appendChild(snackbar);
        
        // Show and then fade out the snackbar
        setTimeout(() => snackbar.classList.add("show"), 100);
        setTimeout(() => snackbar.classList.remove("show"), 3000);
        setTimeout(() => snackbar.remove(), 3500);
    }
}

// Create an instance of FlashcardEditor with a new storage object
const flashcardEditor = new FlashcardEditor(new FlashcardStorage());
