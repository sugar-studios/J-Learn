class FlashcardManager {
    constructor(storage) {
        this.storage = storage;
        this.setsContainer = document.getElementById("sets-container");
        this.editContainer = document.getElementById("edit-container");
        this.deleteModal = document.getElementById("delete-modal");
        this.confirmDeleteButton = document.getElementById("confirm-delete");
        this.cancelDeleteButton = document.getElementById("cancel-delete");
        this.deleteIndex = null;

        this.initialize();
    }

    initialize() {
        console.log("Initializing Flashcard Manager...");
        this.confirmDeleteButton.addEventListener("click", () => this.deleteFlashcardSet());
        this.cancelDeleteButton.addEventListener("click", () => this.cancelDelete());

        this.renderFlashcardSets();
    }

    renderFlashcardSets() {
        this.renderFilteredSets(this.storage.getUserFlashcardSets());
    }

    renderFilteredSets(sets) {
        this.setsContainer.innerHTML = "";
        this.editContainer.innerHTML = "";

        sets.forEach((set, index) => {
            const loadSetElement = this.createSetElement(set.name, () => {
                startFlashcardSession(set);
            });

            const editSetElement = this.createSetElement(set.name, () => {
                flashcardEditor.loadFlashcardSetForEditing(set, index);
            });

            const deleteBtn = document.createElement("span");
            deleteBtn.textContent = "❌";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                this.deleteIndex = index;
                this.deleteModal.style.display = "block";
            });

            editSetElement.appendChild(deleteBtn);
            this.setsContainer.appendChild(loadSetElement);
            this.editContainer.appendChild(editSetElement);
        });
    }

    createSetElement(name, onClick) {
        const element = document.createElement("div");
        element.classList.add("set-card");
        element.textContent = name;
        element.addEventListener("click", onClick);
        return element;
    }

    deleteFlashcardSet() {
        if (this.deleteIndex !== null) {
            const setName = this.storage.getUserFlashcardSets()[this.deleteIndex].name;
            this.storage.deleteFlashcardSet(setName);
            this.deleteIndex = null;
            this.renderFlashcardSets(); // Ensure all sections update!
            this.deleteModal.style.display = "none";
        }
    }

    cancelDelete() {
        this.deleteModal.style.display = "none";
        this.deleteIndex = null;
    }
}

// Instantiate Flashcard Manager
const flashcardManager = new FlashcardManager(new FlashcardStorage());
