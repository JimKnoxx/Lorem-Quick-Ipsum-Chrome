function saveOptions() {
    const device = window.chrome || window.browser;
    if (null == device) {
        return;
    }

    device.storage.sync.set({
        minWordLength: document.getElementById("minWordLength").value,
        wordFirstLetter: document.getElementById("wordFirstLetter").value,
        minSentenceLength: document.getElementById("minSentenceLength").value,
        maxSentenceLength: document.getElementById("maxSentenceLength").value,
        minParagraphLength: document.getElementById("minParagraphLength").value,
        maxParagraphLength: document.getElementById("maxParagraphLength").value,
    }, function() {
        const status = document.getElementById("okText");
        status.classList.remove('hidden');
        setTimeout(function() {
            status.classList.add('hidden');
        }, 750);
    });
}

function restoreOptions() {
    const device = window.chrome || window.browser;
    if (null == device) {
        return;
    }

    device.storage.sync.get({
        minWordLength: 0,
        wordFirstLetter: "WORD_FIRST_LETTER_RANDOM",
        minSentenceLength: 7,
        maxSentenceLength: 10,
        minParagraphLength: 4,
        maxParagraphLength: 8
    }, function(res) {
        document.getElementById("minWordLength").value = res.minWordLength;
        document.getElementById("wordFirstLetter").value = res.wordFirstLetter;
        document.getElementById("minSentenceLength").value = res.minSentenceLength;
        document.getElementById("maxSentenceLength").value = res.maxSentenceLength;
        document.getElementById("minParagraphLength").value = res.minParagraphLength;
        document.getElementById("maxParagraphLength").value = res.maxParagraphLength;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
