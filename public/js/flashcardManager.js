// The FlashcardManager handles the display and management of all flashcard sets on the page
class FlashcardManager {
    constructor(storage) {
        // Accepts a storage instance (FlashcardStorage) for saving/loading sets
        this.storage = storage;

        // Grabs references to various DOM elements for displaying and editing sets
        this.setsContainer = document.getElementById("sets-container");
        this.editContainer = document.getElementById("edit-container");
        this.deleteModal = document.getElementById("delete-modal");
        this.confirmDeleteButton = document.getElementById("confirm-delete");
        this.cancelDeleteButton = document.getElementById("cancel-delete");

        // Tracks which flashcard set is pending deletion (by index)
        this.deleteIndex = null;

        // Sets up event listeners and renders existing sets on page load
        this.initialize();
    }

    // Initializes the manager: adds click handlers for deleting and canceling deletion, then renders sets
    initialize() {
        console.log("Initializing Flashcard Manager...");
        this.confirmDeleteButton.addEventListener("click", () => this.deleteFlashcardSet());
        this.cancelDeleteButton.addEventListener("click", () => this.cancelDelete());
        this.renderFlashcardSets();
    }

    // Renders all flashcard sets by loading them from storage
    renderFlashcardSets() {
        this.renderFilteredSets(this.storage.getUserFlashcardSets());
    }

    // Clears any existing HTML for sets, then displays each set in two sections (view mode and edit mode)
    renderFilteredSets(sets) {
        this.setsContainer.innerHTML = "";
        this.editContainer.innerHTML = "";

        sets.forEach((set, index) => {
            // "Load" card that starts a flashcard session when clicked
            const loadSetElement = this.createSetElement(set.name, () => {
                startFlashcardSession(set);
            });

            // "Edit" card that opens the flashcard editor when clicked
            const editSetElement = this.createSetElement(set.name, () => {
                flashcardEditor.loadFlashcardSetForEditing(set, index);
            });

            // A small 'X' button for deleting the set; opens a confirm modal
            const deleteBtn = document.createElement("span");
            deleteBtn.textContent = "❌";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                this.deleteIndex = index;
                this.deleteModal.style.display = "block";
            });

            editSetElement.appendChild(deleteBtn);

            // Append both elements to their respective containers
            this.setsContainer.appendChild(loadSetElement);
            this.editContainer.appendChild(editSetElement);
        });
    }

    // Helper function to create a clickable "set card"
    createSetElement(name, onClick) {
        const element = document.createElement("div");
        element.classList.add("set-card");
        element.textContent = name;
        element.addEventListener("click", onClick);
        return element;
    }

    // Actually deletes the flashcard set after user confirms
    deleteFlashcardSet() {
        if (this.deleteIndex !== null) {
            const setName = this.storage.getUserFlashcardSets()[this.deleteIndex].name;
            this.storage.deleteFlashcardSet(setName);
            this.deleteIndex = null;

            // Refreshes the page view to remove the deleted set
            this.renderFlashcardSets(); 
            this.deleteModal.style.display = "none";
        }
    }

    // Closes the deletion modal without removing any data
    cancelDelete() {
        this.deleteModal.style.display = "none";
        this.deleteIndex = null;
    }
}

// Create a new instance of FlashcardManager, using an instance of FlashcardStorage
const flashcardManager = new FlashcardManager(new FlashcardStorage());
