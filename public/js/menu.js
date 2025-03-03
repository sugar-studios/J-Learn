document.addEventListener("DOMContentLoaded", function () {
    try {
        const tagDropdownButton = document.getElementById("tagDropdownButton");
        const tagSelection = document.getElementById("tag-selection");

        if (tagDropdownButton && tagSelection) {
            tagDropdownButton.addEventListener("click", function () {
                tagSelection.classList.toggle("active");
                tagDropdownButton.classList.toggle("active");
            });
        }
    } catch (error) {
        console.log("No tag-selection exists");
    }

    try {
        const navToggle = document.getElementById("navToggle");
        const navMenu = document.getElementById("navMenu");

        if (navToggle && navMenu) {
            navToggle.addEventListener("click", function () {
                navMenu.classList.toggle("active");
                navToggle.classList.toggle("active");
            });
        }
    } catch (error) {
        console.log("No navigation selection exists");
    }
});
