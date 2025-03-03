document.addEventListener("DOMContentLoaded", () => {
    fetch("data/code.json")
        .then(response => response.json())
        .then(data => {
            const fileList = document.getElementById("file-list");
            let activeTooltip = null;

            data.files.forEach(file => {
                const fileEntry = document.createElement("div");
                fileEntry.classList.add("file-entry");

                // File Header (Collapsible)
                const fileQuestion = document.createElement("button");
                fileQuestion.classList.add("file-question");
                fileQuestion.textContent = file.name;

                // File Content (Hidden Initially)
                const fileAnswer = document.createElement("div");
                fileAnswer.classList.add("file-answer");

                // File Description
                const fileDescription = document.createElement("p");
                fileDescription.textContent = file.desc;
                fileAnswer.appendChild(fileDescription);

                // Code + Tooltip Layout
                const codeContainer = document.createElement("pre");
                codeContainer.classList.add("code-container");

                file.blocks.forEach((block, index) => {
                    const blockWrapper = document.createElement("div");
                    blockWrapper.classList.add("code-block-wrapper");

                    const blockElement = document.createElement("span");
                    blockElement.classList.add("code-block");
                    blockElement.innerHTML = highlightCode(block.code);

                    // Tooltip Section (Initially Hidden)
                    const tooltipSection = document.createElement("div");
                    tooltipSection.classList.add("tooltip-section");
                    tooltipSection.textContent = block.tooltip;
                    tooltipSection.style.height = "0"; // Start collapsed

                    blockElement.addEventListener("mouseenter", () => {
                        blockWrapper.classList.add("glow");
                    });

                    blockElement.addEventListener("mouseleave", () => {
                        blockWrapper.classList.remove("glow");
                    });

                    // Click to toggle nested tooltip section
                    blockElement.addEventListener("click", (event) => {
                        event.stopPropagation(); // Prevent document click from closing it

                        if (activeTooltip && activeTooltip !== tooltipSection) {
                            closeTooltip(activeTooltip);
                        }

                        if (tooltipSection.style.height === "0px" || tooltipSection.style.height === "") {
                            openTooltip(tooltipSection, blockWrapper);
                        } else {
                            closeTooltip(tooltipSection);
                        }
                        activeTooltip = tooltipSection.style.height !== "0px" ? tooltipSection : null;
                    });

                    blockWrapper.appendChild(blockElement);
                    blockWrapper.appendChild(tooltipSection);
                    codeContainer.appendChild(blockWrapper);
                });

                fileAnswer.appendChild(codeContainer);
                fileEntry.appendChild(fileQuestion);
                fileEntry.appendChild(fileAnswer);
                fileList.appendChild(fileEntry);

                // Toggle visibility on click
                fileQuestion.addEventListener("click", () => {
                    fileQuestion.classList.toggle("active");
                    fileAnswer.style.maxHeight = fileAnswer.style.maxHeight ? null : fileAnswer.scrollHeight + "px";
                });
            });

            // Clicking outside should close any open tooltips
            document.addEventListener("click", () => {
                if (activeTooltip) {
                    closeTooltip(activeTooltip);
                    activeTooltip = null;
                }
            });
        })
        .catch(error => console.error("Error loading development data:", error));
});

// **🔹 Function to Open Tooltip (Expands Section)**
function openTooltip(tooltip, blockWrapper) {
    tooltip.style.display = "block";
    tooltip.style.height = tooltip.scrollHeight + 15 + "px";
    tooltip.style.padding = "10px";
    blockWrapper.classList.add("expanded"); // Pushes code down
}

// **🔹 Function to Close Tooltip (Collapses Section)**
function closeTooltip(tooltip) {
    tooltip.style.height = "0";
    tooltip.style.padding = "0";
    setTimeout(() => {
        tooltip.style.display = "none";
    }, 300); // Delay to match animation
}

// **🔹 Syntax Highlighting Function**
function highlightCode(code) {
    return code
        .replace(/"(.*?)"/g, '<span class="highlight string">"$1"</span>') // Strings
        .replace(/\b(function|return|if|else|let|const|var|for|while|switch|case|break|default|new|class|extends|super|import|export|try|catch|finally|throw|typeof|instanceof|async|await)\b/g,
                 '<span class="highlight keyword">$1</span>') // Keywords
        .replace(/\b(console|document|window|fetch|Math)\b/g,
                 '<span class="highlight function">$1</span>') // Functions
        .replace(/\b([0-9]+)\b/g, '<span class="highlight number">$1</span>') // Numbers
        .replace(/\/\/(.*)/g, '<span class="highlight comment">//$1</span>'); // Comments
}
