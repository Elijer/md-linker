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

// Small notice that pops up from the cursor, used by the hover-link hotkeys
const showCursorMessage = (msg, classThing = "--") => {
  const splash = document.createElement("div");
  splash.classList.add("cursor-splash");
  splash.classList.add(classThing);
  splash.textContent = msg;
  splash.style.left = `${mouseX}px`;
  splash.style.top = `${mouseY}px`;
  splash.addEventListener("animationend", () => splash.remove());
  document.body.appendChild(splash);
};

// Function to copy rich text with link using execCommand (legacy method)
function copyRichTextLegacy(text, href = window.location.href) {
  // Create temp link element
  const link = document.createElement("a");
  link.href = href;
  link.textContent = text;
  document.body.appendChild(link);

  // Select the content
  const range = document.createRange();
  range.selectNode(link);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (err) {}

  // Clean up
  selection.removeAllRanges();
  document.body.removeChild(link);
  return copied;
}

// Function to copy rich text using the modern Clipboard API
async function copyRichTextModern(text, href = window.location.href) {
  try {
    // Create HTML content with the link
    const link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    const htmlContent = link.outerHTML;

    // Create clipboard data
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([htmlContent], { type: "text/html" }),
      "text/plain": new Blob([text], { type: "text/plain" }),
    });

    await navigator.clipboard.write([clipboardItem]);
    return true;
  } catch (err) {
    // Fallback to legacy method
    return copyRichTextLegacy(text, href);
  }
}

// Main function that tries modern method first, falls back to legacy.
// Resolves to whether the copy succeeded.
async function copyAsRichText(text, href = window.location.href) {
  // Check if modern Clipboard API is supported
  if (navigator.clipboard && window.ClipboardItem) {
    return copyRichTextModern(text, href);
  }
  return copyRichTextLegacy(text, href);
}

// Visible text of a link, falling back to labels or the url itself (e.g. image links)
function getLinkText(link) {
  const text = link.innerText.trim().replace(/\s+/g, " ");
  return text || link.getAttribute("aria-label") || link.title || link.href;
}

// --------------------------- LISTENERS ------------------------------------

let selectedText = "";
let hoveredLink = null;
let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

document.addEventListener("mouseover", (event) => {
  hoveredLink = event.target.closest ? event.target.closest("a[href]") : null;
});

document.addEventListener("mouseup", (event) => {
  selectedText = window.getSelection().toString();
});

document.addEventListener(
  "keydown",
  (event) => {
    // Ctrl + Option + C / X while hovering a link. Uses event.code since
    // Option changes event.key on macOS (e.g. Option+C produces "ç").
    if (event.ctrlKey && event.altKey && !event.metaKey && hoveredLink) {
      if (event.code === "KeyC") {
        event.preventDefault();
        copyAsRichText(getLinkText(hoveredLink), hoveredLink.href).then((ok) =>
          ok
            ? showCursorMessage("Copied rich-text link!")
            : showCursorMessage("Problem copying link", "copy-error")
        );
      }

      if (event.code === "KeyX") {
        event.preventDefault();
        navigator.clipboard
          .writeText(hoveredLink.href)
          .then(() => showCursorMessage("Copied link!"))
          .catch(() => showCursorMessage("Problem copying link", "copy-error"));
      }
    }

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
        copyAsRichText(selectedText).then((ok) =>
          ok
            ? showMessage("Rich text successfully copied!")
            : showMessage("failed to copy rich text link", "copy-error")
        );
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
