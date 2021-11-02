/** SETUP */

const WORD_FIRST_LETTER_SMALL = 'small';
const WORD_FIRST_LETTER_BIG = 'big';
const WORD_FIRST_LETTER_RANDOM = 'random';
// Backup if loading does not work
const BACKUP_LOREM = ["lorem", "ipsum", "dolor", "sit", "amet", "consetetur", "sadipscing", "elitr", "sed", "diam", "nonumy", "eirmod", "tempor", "invidunt", "ut", "labore", "et", "dolore", "magna", "aliquyam", "erat", "voluptua", "at", "vero", "eos", "accusam", "justo", "duo", "dolores", "ea", "rebum", "stet", "clita", "kasd", "gubergren", "no", "sea", "takimata", "sanctus", "est", "amet"];

let lorem;
let minWordLength;
let wordFirstLetter;
let minSentenceLength;
let maxSentenceLength ;
let minParagraphLength;
let maxParagraphLength;

const device = window.chrome || window.browser;
if (null == device) {
    close();
}

/* Read user setting values */
device.storage.sync.get({
    minWordLength: 0,
    wordFirstLetter: WORD_FIRST_LETTER_RANDOM,
    minSentenceLength: 7,
    maxSentenceLength: 10,
    minParagraphLength: 4,
    maxParagraphLength: 8
}, (res) => {
    minWordLength = res.minWordLength;
    switch (res.wordFirstLetter) {
        case WORD_FIRST_LETTER_RANDOM:
            wordFirstLetter = WORD_FIRST_LETTER_RANDOM;
            break;
        case WORD_FIRST_LETTER_BIG:
            wordFirstLetter = WORD_FIRST_LETTER_BIG;
            break;
        case WORD_FIRST_LETTER_SMALL:
            wordFirstLetter = WORD_FIRST_LETTER_SMALL;
            break;
        default:
            wordFirstLetter = WORD_FIRST_LETTER_RANDOM;
            break;
    }
    minSentenceLength = res.minSentenceLength;
    maxSentenceLength = res.maxSentenceLength;
    minParagraphLength = res.minParagraphLength;
    maxParagraphLength = res.maxParagraphLength;
});

const words = document.querySelectorAll('[id^=word-]');
words.forEach(word => hoverElements(word, words));

const sentences = document.querySelectorAll('[id^=sentence-]');
sentences.forEach(sentence => hoverElements(sentence, sentences));

const paragraphs = document.querySelectorAll('[id^=paragraph-]');
paragraphs.forEach(paragraph => hoverElements(paragraph, paragraphs));

document.getElementById('settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    close();
});

/** FUNCTIONS */
/* Adding event listener to "buttons" */
function hoverElements(item, elements) {
    item.addEventListener('mouseover', () => {
        const hoverId = item.id.substr(item.id.length - 1);
        elements.forEach(element => {
            if (element.id.substr(element.id.length - 1) <= hoverId) {
                element.classList.add("hover");
            }
        });
    });
    item.addEventListener('mouseout', () => {
        elements.forEach(element => {
            element.classList.remove("hover");
        });
    });
    item.addEventListener('click', () => {
        const hoverId = item.id.substr(item.id.length - 1);
        if (item.id.startsWith('word')) {
            navigator.clipboard.writeText(getWords(hoverId)).then(function() {
                close();
            }, function() {
                console.error("Unable to write to clipboard. :-(");
            });
        }
        if (item.id.startsWith('sentence')) {
            navigator.clipboard.writeText(getSentences(hoverId)).then(function() {
                close();
            }, function() {
                console.error("Unable to write to clipboard. :-(");
            });
        }
        if (item.id.startsWith('paragraph')) {
            navigator.clipboard.writeText(getParagraphs(hoverId)).then(function() {
                close();
            }, function() {
                console.error("Unable to write to clipboard. :-(");
            });
        }
    });
}

/* Try load the dictionary */
(async () => {
    try {
        const content = await fetch('loremipsum.txt');
        lorem = await content.text();
        lorem = lorem.split(/\r\n|\n|\r/);
    } catch (e) {
        lorem = BACKUP_LOREM;
    }
})()

/* Filter the dictionary by user specified word length */
function getWordsLongerThen(length) {
    if (minWordLength === 0) {
        return lorem;
    }

    return lorem.filter((element) => {
        return element.length > length;
    });
}

/* Returns a string with the given amount of words */
function getWords(amount) {
    let words = "";
    const filteredWords = getWordsLongerThen(minWordLength);

    for (let i = 0; i < amount; i++) {
        if (wordFirstLetter === WORD_FIRST_LETTER_BIG || (wordFirstLetter === WORD_FIRST_LETTER_RANDOM && getRandomInt(10) > 4)) {
            words += capitalizeFirstLetter(filteredWords[getRandomInt(filteredWords.length)]);
        } else {
            words += filteredWords[getRandomInt(filteredWords.length)];
        }
        words += " ";
    }

    return words.trim();
}

/* Returns a string with the given amount of sentences */
function getSentences(amount) {
    wordFirstLetter = WORD_FIRST_LETTER_SMALL;
    let sentences = "";

    for (let i = 0; i < amount; i++) {
        sentences += capitalizeFirstLetter(getWords(getRandomInt(maxSentenceLength, minSentenceLength))) + ". "
    }

    return sentences.trim();
}

/* Returns a string with the given amount of paragraphs */
function getParagraphs(amount) {
    wordFirstLetter = WORD_FIRST_LETTER_SMALL;
    let paragraphs = "";

    for (let i = 0; i < amount; i++) {
        paragraphs += getSentences(getRandomInt(maxParagraphLength, minParagraphLength)) + "\n"
    }

    return paragraphs.trim();
}

/* Returns a random int between min (inc) and max (exc), also checks if user tried to use min > max */
function getRandomInt(max, min = 0) {
    if (min > max) {
        const tmpMax = max;
        max = min;
        min = tmpMax;
    }
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
}

/* Makes the first letter rich. */
function capitalizeFirstLetter(string) {
    return (string.charAt(0).toUpperCase() + string.slice(1));
}
