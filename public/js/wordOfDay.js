document.addEventListener("DOMContentLoaded", function () {
  fetch("data/wordOfDay.json")
    .then((response) => response.json())
    .then((data) => {
      const words = data.words;
      let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Phoenix";
      const today = new Date().toLocaleDateString("en-US", { timeZone });

      let seed = 0;
      for (let i = 0; i < today.length; i++) {
        seed += today.charCodeAt(i);
      }

      const wordIndex = seed % words.length;
      const word = words[wordIndex];

      const wordBox = document.querySelector(".word-box");
      const wordKanji = document.getElementById("word-kanji");
      const wordRomaji = document.getElementById("word-romanji");
      const wordEnglish = document.getElementById("word-english");
      const tooltip = document.querySelector(".tooltip");

      let inEnglishMode = false;
      let showingKanji = true;
      let showingRomaji = true;
      let tooltipDisabled = false;

      wordKanji.textContent = word.kanji;
      wordRomaji.textContent = word.romaji;
      wordEnglish.textContent = `${word.english} (${word.part_of_speech})`;
      wordRomaji.style.display = "none";
      wordEnglish.style.display = "none";

      function updateTooltipText() {
        if (inEnglishMode) {
          tooltip.textContent = "Click to bring back Kanji";
        } else {
          tooltip.textContent = "Click to reveal translation";
        }
      }

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

      function disableTooltip(duration) {
        tooltipDisabled = true;
        hideTooltip();
        setTimeout(() => {
          tooltipDisabled = false;
          updateTooltipText();
        }, duration);
      }

      function toggleKanjiHiragana() {
        wordKanji.textContent = showingKanji ? word.hiragana : word.kanji;
        showingKanji = !showingKanji;
      }

      function toggleRomajiHiragana() {
        wordRomaji.textContent = showingRomaji ? word.hiragana : word.romaji;
        showingRomaji = !showingRomaji;
      }

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

      wordKanji.addEventListener("click", toggleKanjiHiragana);
      wordRomaji.addEventListener("click", toggleRomajiHiragana);
      wordBox.addEventListener("click", function(event) {
        if (!event.target.matches("#word-kanji, #word-romanji")) {
          toggleEnglishMode();
        }
      });

      wordBox.addEventListener("mouseenter", showTooltip);
      wordBox.addEventListener("mouseleave", hideTooltip);
    })
    .catch((error) => console.error("Error loading word of the day:", error));
});