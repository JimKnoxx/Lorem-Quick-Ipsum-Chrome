/** SETUP */
import {hasWCAGContrastToWhite, shadeColor} from "../resources/colorHelper.js";

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
    maxParagraphLength: 8,
    backgroundColorSelector: "#666666FF",
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
    setPanelBackgroundColor(res.backgroundColorSelector);
});

function setPanelBackgroundColor(hex) {
    const htmlRoot = document.querySelector(':root');
    const darkMode = !hasWCAGContrastToWhite(hex);

    htmlRoot.style.setProperty('--panel-bg', hex);
    htmlRoot.style.setProperty('--button-hover-bg',
        shadeColor(hex, darkMode ? -100 : 100)
    );
    if (darkMode) {
        htmlRoot.setAttribute('data-theme', 'dark');
    }
}

const words = document.querySelectorAll('[id^=word-]');
words.forEach(word => addClickEvent(word, words));

const sentences = document.querySelectorAll('[id^=sentence-]');
sentences.forEach(sentence => addClickEvent(sentence, sentences));

const paragraphs = document.querySelectorAll('[id^=paragraph-]');
paragraphs.forEach(paragraph => addClickEvent(paragraph, paragraphs));

function addClickEvent(item, elements) {
    item.addEventListener('click', () => {
        const hoverId = item.id.substring(item.id.length - 1);
        if (item.id.startsWith('word')) {
            navigator.clipboard.writeText(getWordsLength(hoverId)).then(function() {
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

document.getElementById('face').addEventListener('click', () => {
    copyImage('https://thispersondoesnotexist.com/');
});

document.getElementById('sizePreset1').addEventListener('click', () => {
    document.getElementById('fwidth').value = 512;
    document.getElementById('fheight').value = 512;
});

document.getElementById('sizePreset2').addEventListener('click', () => {
    document.getElementById('fwidth').value = 720;
    document.getElementById('fheight').value = 480;
});

document.getElementById('sizePreset3').addEventListener('click', () => {
    document.getElementById('fwidth').value = 640;
    document.getElementById('fheight').value = 360;
});

document.getElementById('picsum').addEventListener('click', () => {
    const w = document.getElementById('fwidth').value;
    const h = document.getElementById('fheight').value;
    const url = `https://picsum.photos/${w}/${h}`;

    copyImage(url);
});

document.getElementById('settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    close();
});

/** FUNCTIONS */
async function copyImage(imageURL){
  const blob = await imageToBlob(imageURL)
  const item = new ClipboardItem({ "image/png": blob });
  await navigator.clipboard.write([item]);
  close();
}

function imageToBlob(imageURL) {
  const img = new Image;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  img.crossOrigin = "";
  img.src = imageURL;
  return new Promise(resolve => {
    img.onload = function () {
      c.width = this.naturalWidth;
      c.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);
      c.toBlob((blob) => {
        // here the image is a blob
        resolve(blob)
    }, "image/png", 1);
    };
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

/* Filter the dictionary by user specified word length, greater then */
function getWordsLongerThen(length) {
    if (minWordLength === 0) {
        return lorem;
    }

    return lorem.filter((element) => {
        return element.length > length;
    });
}

/* Filter the dictionary by user specified word length, exactly */
function getWordsExactly(length) {
    return lorem.filter((element) => {
        return element.length === length;
    });
}

/* Returns a string with a defined length of words */
const WORD_LENGTH = [4, 8, 16, 32, 64];
function getWordsLength(length) {
    if (length <= 2) {
        const filteredWords = getWordsExactly(WORD_LENGTH[length - 1]);
        if (wordFirstLetter === WORD_FIRST_LETTER_BIG || (wordFirstLetter === WORD_FIRST_LETTER_RANDOM && getRandomInt(10) > 4)) {
            return capitalizeFirstLetter(filteredWords[getRandomInt(filteredWords.length)]);
        } else {
            return filteredWords[getRandomInt(filteredWords.length)];
        }
    } else {
        let returnWord = "";
        while (returnWord.length <= WORD_LENGTH[length - 1]) {
            if (wordFirstLetter === WORD_FIRST_LETTER_BIG || (wordFirstLetter === WORD_FIRST_LETTER_RANDOM && getRandomInt(10) > 4)) {
                returnWord += capitalizeFirstLetter(lorem[getRandomInt(lorem.length)]);
            } else {
                returnWord += lorem[getRandomInt(lorem.length)];
            }
        }

        return returnWord.substring(0, WORD_LENGTH[length - 1]);
    }
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
        paragraphs += getSentences(getRandomInt(maxParagraphLength, minParagraphLength)) + "\n\n"
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
