document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".faq-question").forEach(button => {
      button.addEventListener("click", () => {
        button.classList.toggle("active");
        let answer = button.nextElementSibling;
        answer.style.maxHeight = answer.style.maxHeight ? null : answer.scrollHeight + "px";
      });
    });
  });