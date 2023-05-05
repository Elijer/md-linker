
// ----------------------------------------------------------------
// # Functions

const initiateMarkdownCopy = (text) => {
    const absContainer = document.createElement("div")
    const copySplash = document.createElement("div");
    copySplash.setAttribute("id", "copy-splash")
    copySplash.setAttribute("class", "hideMe")
    navigator.clipboard.writeText(text)
    copySplash.innerHTML = `markdown link copied!`
    document.body.appendChild(copySplash)
}

// ----------------------------------------------------------------
// # Listeners

// initiateMarkdownCopy("HELLO")

let selectedText = ''

document.addEventListener("mouseup", (event) => {
    const selection = window.getSelection().toString()
    selectedText = `[${selection}](${window.location.href})`
});

document.addEventListener('keydown', (event) => {
    if (event.key === "." && event.shiftKey === true && event.metaKey === true){
        if (selectedText.length > 1){
            initiateMarkdownCopy(selectedText)
        }
    }
}, false);