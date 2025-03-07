// Wait until the DOM is fully loaded before executing
document.addEventListener("DOMContentLoaded", () => {

  // Find every element with class "faq-question" and set up an event listener
  document.querySelectorAll(".faq-question").forEach(button => {

    // On click, toggle the "active" class to highlight the question,
    // and expand or collapse the corresponding answer panel
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      let answer = button.nextElementSibling;
      answer.style.maxHeight = answer.style.maxHeight ? null : answer.scrollHeight + "px";
    });
  });
});
