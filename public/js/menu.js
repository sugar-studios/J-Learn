// Wait until the document is fully loaded before running any JavaScript
document.addEventListener("DOMContentLoaded", function () {

    // Safely attempt to find and add functionality to the tag dropdown
    try {
        const tagDropdownButton = document.getElementById("tagDropdownButton");
        const tagSelection = document.getElementById("tag-selection");

        // If both elements exist, toggle "active" class on click 
        // to show/hide the dropdown menu
        if (tagDropdownButton && tagSelection) {
            tagDropdownButton.addEventListener("click", function () {
                tagSelection.classList.toggle("active");
                tagDropdownButton.classList.toggle("active");
            });
        }
    } catch (error) {
        // If those elements don't exist, log a message (avoids runtime error)
        console.log("No tag-selection exists");
    }

    // Safely attempt to find and add functionality to the navigation toggle
    try {
        const navToggle = document.getElementById("navToggle");
        const navMenu = document.getElementById("navMenu");

        // If both elements exist, toggle "active" class on click 
        // to show/hide the navigation menu
        if (navToggle && navMenu) {
            navToggle.addEventListener("click", function () {
                navMenu.classList.toggle("active");
                navToggle.classList.toggle("active");
            });
        }
    } catch (error) {
        // If those elements don't exist, log a message (avoids runtime error)
        console.log("No navigation selection exists");
    }
});
