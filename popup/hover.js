const sentences = document.querySelectorAll('[id^=sentence-]');
sentences.forEach(sentence => hoverElements(sentence, sentences));

const paragraphs = document.querySelectorAll('[id^=paragraph-]');
paragraphs.forEach(paragraph => hoverElements(paragraph, paragraphs));

/* Adding event listener to "buttons" */
function hoverElements(item, elements) {
    item.addEventListener('mouseover', () => {
        const hoverId = item.id.substring(item.id.length - 1);
        elements.forEach(element => {
            if (element.id.substring(element.id.length - 1) <= hoverId) {
                element.classList.add("hover");
            }
        });
    });
    item.addEventListener('mouseout', () => {
        elements.forEach(element => {
            element.classList.remove("hover");
        });
    });
}
