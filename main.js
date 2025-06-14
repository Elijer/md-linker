// --------------------------- FUNCTIONS ------------------------------------

function getMonthYear() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-based
  const year = String(now.getFullYear()).slice(-2); // last two digits of year
  return `${month}/${year}`;
}

function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

const now = new Date();
const month = String(now.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-based
const year = String(now.getFullYear()).slice(-2); // last two digits of year
const monthYear = `${month}/${year}`;

const initiateMarkdownCopy = (text) => {
  const copySplash = document.createElement("div");
  copySplash.classList.add("copy-splash");
  copySplash.classList.add("hideMe");
  navigator.clipboard.writeText(text);
  copySplash.innerHTML = `markdown link copied!`;
  document.body.appendChild(copySplash);
};

const showMessage = (msg, classThing = "--") => {
  const copySplash = document.createElement("div");
  copySplash.classList.add("copy-splash");
  copySplash.classList.add(classThing);
  copySplash.classList.add("hideMe");
  copySplash.innerHTML = msg;
  document.body.appendChild(copySplash);
};

// Function to copy rich text with link using execCommand (legacy method)
function copyRichTextLegacy(text) {
  // Create temp link element
  const link = document.createElement("a");
  link.href = window.location.href;
  link.textContent = text;

  // Select the content
  const range = document.createRange();
  range.selectNode(link);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  try {
    document.execCommand("copy");
    showMessage("Rich text successfully copied!");
  } catch (err) {
    showMessage("failed to copy rich text link", "copy-error");
  }

  // Clean up
  selection.removeAllRanges();
  document.body.removeChild(tempDiv);
}

// Function to copy rich text using the modern Clipboard API
async function copyRichTextModern(text) {
  try {
    // Create HTML content with the link
    const htmlContent = `<a href="${window.location.href}">${text}</a>`;

    // Create clipboard data
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([htmlContent], { type: "text/html" }),
      "text/plain": new Blob([text], { type: "text/plain" }),
    });

    await navigator.clipboard.write([clipboardItem]);
    showMessage("Rich text successfully copied!");
  } catch (err) {
    showMessage("Problem copying rich text link with method #1");
    // Fallback to legacy method
    copyRichTextLegacy(text);
  }
}

// Main function that tries modern method first, falls back to legacy
function copyAsRichText(text) {
  // Check if modern Clipboard API is supported
  if (navigator.clipboard && window.ClipboardItem) {
    copyRichTextModern(text);
  } else {
    copyRichTextLegacy(text);
  }
}

// --------------------------- LISTENERS ------------------------------------

let selectedText = "";

document.addEventListener("mouseup", (event) => {
  selectedText = window.getSelection().toString();
});

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "." &&
      event.shiftKey === true &&
      event.metaKey === true
    ) {
      if (selectedText.length > 1) {
        // Copy link to clipboard as Markdown
        try {
          navigator.clipboard.writeText(
            `[${selectedText}](${window.location.href})`
          );
          showMessage("Copied MD link to clipboard! 😎", "md-text");
        } catch {
          showMessage("Problem copying markdown link", "copy-error");
        }
      }
    }

    if (
      event.key === "," &&
      event.shiftKey === true &&
      event.metaKey === true
    ) {
      if (selectedText.length > 1) {
        copyAsRichText(selectedText);
      }
    }

    if (
      event.key === "'" &&
      event.shiftKey === true &&
      event.metaKey === true
    ) {
      if (selectedText.length > 1) {
        try {
          let host = window.location.host;
          let title = truncate(document.title, 42);
          let monthYear = getMonthYear();
          navigator.clipboard.writeText(
            `"${selectedText}"([${host} - ${monthYear}](${window.location.href}))`
            // `"${selectedText}"([${host}|${title}|${monthYear}](${window.location.href}))`
          );
          showMessage(
            "Copied text with MD citation to clipboard! 😎",
            "md-text"
          );
        } catch {
          showMessage("Problem copying markdown link", "copy-error");
        }
      }
    }
  },
  false
);
