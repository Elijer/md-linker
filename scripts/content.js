let product = ''

document.addEventListener("mouseup", (event) => {
    const selection = window.getSelection().toString()
    product = `[${selection}](${window.location.href})`
});

document.addEventListener('keydown', (event) => {
    if (event.key === "." && event.shiftKey === true && event.metaKey === true){
        if (product.length > 1){
            navigator.clipboard.writeText(product)
        }
    }
}, false);