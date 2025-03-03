class FlashcardEditor {
    constructor(storage) {
        this.storage = storage;
        this.setNameInput = document.getElementById("set-name");
        this.addCardButton = document.getElementById("add-card");
        this.flashcardList = document.getElementById("flashcard-list");
        this.saveSetButton = document.getElementById("save-set");
        this.copyCodeButton = document.getElementById("copy-code");
        this.importCodeInput = document.getElementById("import-code");
        this.tagSelection = document.getElementById("tag-selection");

        this.flashcards = [];
        this.editingIndex = null;

        this.initialize();
    }

    initialize() {
        console.log("Initializing Flashcard Editor...");

        this.tagSelection.addEventListener("click", (event) => this.toggleTag(event));
        this.addCardButton.addEventListener("click", () => this.addFlashcard());
        this.saveSetButton.addEventListener("click", () => this.saveFlashcardSet());
        this.copyCodeButton.addEventListener("click", () => this.copyExportCode());
        this.importCodeInput.addEventListener("input", () => this.loadImportCode());

        this.resetEditor();
    }

    toggleTag(event) {
        const tag = event.target;
        if (tag.tagName === "LABEL") {
            tag.classList.toggle("selected");
        }
    }

    addFlashcard() {
        const japaneseWord = document.querySelector(".japanese-word").value.trim();
        const englishWord = document.querySelector(".english-word").value.trim();

        if (japaneseWord && englishWord) {
            this.flashcards.push({ japanese: japaneseWord, english: englishWord });
            this.renderFlashcards();
        }
    }

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

    deleteFlashcard(index) {
        this.flashcards.splice(index, 1);
        this.renderFlashcards();
    }

    saveFlashcardSet() {
        console.log("Saving flashcard set...");

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

        const setName = this.setNameInput.value.trim();
        if (!setName || this.flashcards.length === 0) {
            console.warn("Cannot save: Missing name or flashcards.");
            return;
        }

        let selectedTags = [];
        document.querySelectorAll("#tag-selection input:checked").forEach(tag => {
            selectedTags.push(tag.value);
        });

        const newSet = { name: setName, tags: selectedTags, cards: this.flashcards };

        if (this.editingIndex !== null) {
            this.storage.saveFlashcardSet(newSet, this.editingIndex);
            this.editingIndex = null;
        } else {
            this.storage.saveFlashcardSet(newSet);
        }

        flashcardManager.renderFlashcardSets();
        this.resetEditor();
    }

    loadFlashcardSetForEditing(set, index) {
        console.log("Entering edit mode for:", set.name);
        this.editingIndex = index;
        this.setNameInput.value = set.name;
        this.flashcards = [...set.cards];

        document.querySelectorAll("#tag-selection input").forEach(input => {
            input.checked = set.tags.includes(input.value);
        });

        this.renderFlashcards();
        this.toggleImportExportMode(true);
    }

    copyExportCode() {
        const set = this.storage.getUserFlashcardSets()[this.editingIndex];
        if (!set) return;

        const exportCode = btoa(JSON.stringify(set));
        navigator.clipboard.writeText(exportCode);
        this.showSnackbar("Flashcard set copied!");
    }

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

    decodeFlashcardCode(code) {
        try {
            return JSON.parse(atob(code));
        } catch {
            return null;
        }
    }

    toggleImportExportMode(editing) {
        if (editing) {
            this.importCodeInput.style.display = "none";
            this.copyCodeButton.style.display = "block";
        } else {
            this.importCodeInput.style.display = "block";
            this.copyCodeButton.style.display = "none";
        }
    }

    resetEditor() {
        this.setNameInput.value = "";
        this.flashcards = [];
        this.renderFlashcards();
        this.toggleImportExportMode(false);
    }

    showSnackbar(message) {
        const snackbar = document.createElement("div");
        snackbar.className = "snackbar";
        snackbar.innerText = message;
        document.body.appendChild(snackbar);
        setTimeout(() => snackbar.classList.add("show"), 100);
        setTimeout(() => snackbar.classList.remove("show"), 3000);
        setTimeout(() => snackbar.remove(), 3500);
    }
}

// Instantiate Flashcard Editor
const flashcardEditor = new FlashcardEditor(new FlashcardStorage());
