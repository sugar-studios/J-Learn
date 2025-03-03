class FlashcardStorage {
    constructor() {
        this.userId = this.getUserId();
    }

    getUserId() {
        let userId = localStorage.getItem("flashcardUserId");
        if (!userId) {
            userId = "user_" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("flashcardUserId", userId);
        }
        return userId;
    }

    getUserFlashcardSets() {
        const data = localStorage.getItem(`flashcardSets_${this.userId}`);
        return data ? JSON.parse(data) : [];
    }

    saveFlashcardSet(set, index = null) {
        let sets = this.getUserFlashcardSets();

        if (index !== null) {
            sets[index] = set;
        } else {
            const existingIndex = sets.findIndex(s => s.name === set.name);
            if (existingIndex !== -1) {
                sets[existingIndex] = set;
            } else {
                sets.push(set);
            }
        }

        localStorage.setItem(`flashcardSets_${this.userId}`, JSON.stringify(sets));
    }

    deleteFlashcardSet(setName) {
        let sets = this.getUserFlashcardSets();
        sets = sets.filter(set => set.name !== setName);
        localStorage.setItem(`flashcardSets_${this.userId}`, JSON.stringify(sets));
    }
}
