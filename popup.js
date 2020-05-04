function displaySavedPoems() {
    return chrome.storage.sync.get(['saved_poems'], function(result) {
        console.log(result);
        renderSavedPoems(result['saved_poems']);
        const thumbnails = document.querySelectorAll('.thumbnail');
        console.log(thumbnails);
        console.log(Array.from(thumbnails)[2].children[0].innerText);
        console.log(Array.from(thumbnails)[2].children[1].innerText);

    });
};

function renderSavedPoems(poem_list) {
    //TODO: Sort the poems based on date saved.
    for (poem of poem_list) {
        let popup = document.querySelector('#popup');
        let thumbnail = document.createElement('div');
        thumbnail.classList.add('thumbnail');
        let title = document.createElement('div');
        title.classList.add('title');
        let author = document.createElement('div');
        author.classList.add('author');
        title.textContent = poem[1];
        author.textContent = poem[0];
        thumbnail.appendChild(title);
        thumbnail.appendChild(author);
        popup.appendChild(thumbnail);
    }
}

function displayPoem(author, title) {}

async function main() {
    // TODO: fix this
    await displaySavedPoems();
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener('click', (e) => {
            console.log(e);
        });
    });
}

main();
