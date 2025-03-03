document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");
    const emailInput = document.getElementById("email");
    const subjectInput = document.getElementById("subject");
    const messageInput = document.getElementById("message");
    
    const emailError = document.getElementById("email-error");
    const subjectError = document.getElementById("subject-error");
    const messageError = document.getElementById("message-error");

    const sendButton = document.getElementById("send-button");

    // Private email to send messages to
    const recipientEmail = "your_private_email@example.com";

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent form submission

        let valid = true;

        // Validate Email
        if (!emailInput.value.trim() || !emailInput.value.includes("@")) {
            emailError.textContent = "Please enter a valid email.";
            valid = false;
        } else {
            emailError.textContent = "";
        }

        // Validate Subject
        if (!subjectInput.value.trim()) {
            subjectError.textContent = "Subject cannot be empty.";
            valid = false;
        } else {
            subjectError.textContent = "";
        }

        // Validate Message
        if (!messageInput.value.trim()) {
            messageError.textContent = "Message cannot be empty.";
            valid = false;
        } else {
            messageError.textContent = "";
        }

        if (valid) {
            sendEmail();
        }
    });

    function sendEmail() {
        const userEmail = encodeURIComponent(emailInput.value.trim());
        const subject = encodeURIComponent(subjectInput.value.trim());
        const message = encodeURIComponent(messageInput.value.trim());

        const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=From: ${userEmail}%0D%0A%0D%0A${message}`;

        // Open the default email client
        window.location.href = mailtoLink;
    }
});
