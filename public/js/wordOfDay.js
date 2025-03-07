// This waits until the entire HTML document is fully loaded before running
document.addEventListener("DOMContentLoaded", function () {
  
  // Fetches JSON data containing the "words" array
  fetch("data/wordOfDay.json")
    .then((response) => response.json())
    .then((data) => {

      // Gets today's date in the user’s time zone, generates a seed from it,
      // and uses that seed to select the "word of the day" from the fetched array.
      const words = data.words;
      let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Phoenix";
      const today = new Date().toLocaleDateString("en-US", { timeZone });

      let seed = 0;
      for (let i = 0; i < today.length; i++) {
        seed += today.charCodeAt(i);
      }

      const wordIndex = seed % words.length;
      const word = words[wordIndex];

      // Grabbing important elements from the DOM
      const wordBox = document.querySelector(".word-box");
      const wordKanji = document.getElementById("word-kanji");
      const wordRomaji = document.getElementById("word-romanji");
      const wordEnglish = document.getElementById("word-english");
      const tooltip = document.querySelector(".tooltip");

      // State variables to manage display modes (Kanji, Romaji, English)
      let inEnglishMode = false;
      let showingKanji = true;
      let showingRomaji = true;
      let tooltipDisabled = false;

      // Initial setup of word elements (show Kanji by default, hide Romaji/English)
      wordKanji.textContent = word.kanji;
      wordRomaji.textContent = word.romaji;
      wordEnglish.textContent = `${word.english} (${word.part_of_speech})`;
      wordRomaji.style.display = "none";
      wordEnglish.style.display = "none";

      // Updates the tooltip text based on whether or not we're in "English mode"
      function updateTooltipText() {
        if (inEnglishMode) {
          tooltip.textContent = "Click to bring back Kanji";
        } else {
          tooltip.textContent = "Click to reveal translation";
        }
      }

      // Shows and hides the tooltip, if it's not disabled
      function showTooltip() {
        if (!tooltipDisabled) {
          tooltip.style.opacity = "1";
          tooltip.style.visibility = "visible";
        }
      }

      function hideTooltip() {
        tooltip.style.opacity = "0";
        tooltip.style.visibility = "hidden";
      }

      // Temporarily disables the tooltip to avoid flickering or confusion
      function disableTooltip(duration) {
        tooltipDisabled = true;
        hideTooltip();
        setTimeout(() => {
          tooltipDisabled = false;
          updateTooltipText();
        }, duration);
      }

      // Toggles between displaying Kanji and Hiragana on the Kanji element
      function toggleKanjiHiragana() {
        wordKanji.textContent = showingKanji ? word.hiragana : word.kanji;
        showingKanji = !showingKanji;
      }

      // Toggles between displaying Romaji and Hiragana on the Romaji element
      function toggleRomajiHiragana() {
        wordRomaji.textContent = showingRomaji ? word.hiragana : word.romaji;
        showingRomaji = !showingRomaji;
      }

      // Switches between showing the Japanese (Kanji) and the English (Romaji + translation)
      function toggleEnglishMode() {
        if (!inEnglishMode) {
          wordKanji.style.display = "none";
          wordRomaji.style.display = "block";
          wordEnglish.style.display = "block";
        } else {
          wordKanji.style.display = "block";
          wordRomaji.style.display = "none";
          wordEnglish.style.display = "none";
        }
        inEnglishMode = !inEnglishMode;
        updateTooltipText();
        disableTooltip(5000);
      }

      // Event listeners for toggling Kanji/Hiragana and Romaji/Hiragana
      wordKanji.addEventListener("click", toggleKanjiHiragana);
      wordRomaji.addEventListener("click", toggleRomajiHiragana);

      // Clicking outside the Kanji/Romaji text toggles the full English view
      wordBox.addEventListener("click", function(event) {
        if (!event.target.matches("#word-kanji, #word-romanji")) {
          toggleEnglishMode();
        }
      });

      // Shows tooltip on hover, hides on exit
      wordBox.addEventListener("mouseenter", showTooltip);
      wordBox.addEventListener("mouseleave", hideTooltip);
    })
    // Catches and logs any error that occurs during fetching
    .catch((error) => console.error("Error loading word of the day:", error));
});
