// A class that manages flashcard data in local storage for each unique user
class FlashcardStorage {
    
    // Constructor initializes a user ID specific to this user/session
    constructor() {
        this.userId = this.getUserId();
    }

    // Grabs or creates a user ID stored in localStorage
    getUserId() {
        let userId = localStorage.getItem("flashcardUserId");
        
        // If there's no user ID yet, generate one and store it
        if (!userId) {
            userId = "user_" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("flashcardUserId", userId);
        }
        return userId;
    }

    // Retrieves all flashcard sets stored under the current user ID
    getUserFlashcardSets() {
        const data = localStorage.getItem(`flashcardSets_${this.userId}`);
        // If data exists, parse it; otherwise, return an empty array
        return data ? JSON.parse(data) : [];
    }

    // Adds or updates a flashcard set in localStorage
    // (optionally takes an index to specifically update a set by position)
    saveFlashcardSet(set, index = null) {
        let sets = this.getUserFlashcardSets();

        // If an index is provided, replace the set at that index
        if (index !== null) {
            sets[index] = set;
        } else {
            // Otherwise, look for a set with the same name and update if found
            const existingIndex = sets.findIndex(s => s.name === set.name);
            if (existingIndex !== -1) {
                sets[existingIndex] = set;
            } else {
                // If not found, just push the new set into the array
                sets.push(set);
            }
        }

        // Save the updated sets array back into localStorage
        localStorage.setItem(`flashcardSets_${this.userId}`, JSON.stringify(sets));
    }

    // Deletes a flashcard set by name from the user's stored sets
    deleteFlashcardSet(setName) {
        let sets = this.getUserFlashcardSets();
        // Filter out the set with the matching name
        sets = sets.filter(set => set.name !== setName);
        // Save the modified array back to localStorage
        localStorage.setItem(`flashcardSets_${this.userId}`, JSON.stringify(sets));
    }
}
