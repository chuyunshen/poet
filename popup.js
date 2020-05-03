function getSavedPoems() {
    chrome.storage.sync.get(null, function(result) {
        console.log(result);
        renderSavedPoems(result);
    });
};

function renderSavedPoems(poem_list) {
    //TODO: Sort the poems based on date saved.
    for (poem of poem_list) {
        let popup = document.querySelector('#popup');
        let poem = popup.createElement('div');
        poem.classList.add('poem');
        let title = popup.createElement('title');
        let author = popup.createElement('author');
        title.textContent = poem.title;
        author.textContent = poem.author;
        poem.appendChild(title);
        poem.appendChild(author);
        popup.appendChild(poem);
    }
}

displaySavedPoems();
