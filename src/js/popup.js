import {deletePoem} from './storage.js';
import {appendLineBreaks} from './utils.js'
function displaySavedPoems() {
    return new Promise ((resolve, reject) => {
        chrome.storage.sync.get(['saved_poems'], function(result) {
            console.log(result);
            renderSavedPoems(result['saved_poems']);
            const thumbnails = document.querySelectorAll('.thumbnail');
            resolve(result);
        });
    })
};

function renderSavedPoems(poem_list) {
    //TODO: Sort the poems based on date saved.
    for (const poem of poem_list) {
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

async function displayPoem(author, title) {
    let lines;
    try {
        const response = await fetch(
            `http://poetrydb.org/title/${title}`,
            { mode: 'cors'},
        );
        const json = await response.json();
        const lineCount = json[0].lines.length;
        console.log(lineCount);
        lines = json[0].lines;
    } catch (error) {
        console.log(error);
        lines = "An error occured. Please check your Internet connection."
    }
    organizePoemLayout(author, title, lines);
}

function organizePoemLayout(author, title, lines) {
    const popup = document.querySelector('#popup');
    popup.innerHTML = '';
    const titleToDisplay = document.createElement('div');
    titleToDisplay.classList.add('poem-detail-title');
    const authorToDisplay = document.createElement('div');
    authorToDisplay.classList.add('poem-detail-author');
    titleToDisplay.textContent = title;
    authorToDisplay.textContent = author;
    const linesToDisplay = document.createElement('div');
    linesToDisplay.classList.add('poem-detail-lines');
    linesToDisplay.textContent = appendLineBreaks(lines);

    const deleteButton = document.createElement('div');
    deleteButton.classList.add('delete-button');
    deleteButton.innerHTML = '<i class="fa fa-trash-alt" </i>';

    popup.appendChild(titleToDisplay);
    popup.appendChild(authorToDisplay);
    popup.appendChild(linesToDisplay);
    popup.appendChild(deleteButton);
}


async function displaySavedPoemsAndListen() {
    let popup = document.querySelector('#popup');
    popup.innerHTML = '';
    await displaySavedPoems();
    const thumbnails = document.querySelectorAll('.thumbnail');
    console.log(thumbnails);
    thumbnails.forEach(async (thumbnail) => {
        thumbnail.addEventListener('click', async () => {
            const title = thumbnail.children[0].innerText;
            const author = thumbnail.children[1].innerText;
            await displayPoem(author, title);
            listenToDeletePoem(author, title);
        });
    });
}


function displayContact() {
    let popup = document.querySelector('#popup');
    const heart = document.querySelector('.fa-heart');
    heart.style.color = 'grey';
    popup.innerHTML = '';

    const contactBox = document.createElement('div');
    contactBox.classList.add('contact-box');
    const reportText = document.createElement('a');
    reportText.textContent = 'Report a bug';
    reportText.href = 'https://github.com/chuyunshen/poet';
    reportText.target = '_blank';
    contactBox.appendChild(reportText);
    const emailText = document.createElement('a');
    emailText.textContent = 'Contact me';
    emailText.href = 'mailto:chuyunshen123@gmail.com';
    emailText.target = '_blank';
    contactBox.appendChild(emailText);
    popup.appendChild(contactBox);
    const bubble = document.querySelector('.fa-comment-dots');
}

function colorBubble() {
    const bubble = document.querySelector('.fa-comment-dots');
    bubble.style.color = '#458588';
}

function uncolorBubble() {
    const bubble = document.querySelector('.fa-comment-dots');
    bubble.style.color = 'grey';
}

function colorHeart() {
    const heart = document.querySelector('.fa-heart');
    heart.style.color = '#cc241d';
}

function uncolorHeart() {
    const heart = document.querySelector('.fa-heart');
    heart.style.color = 'grey';
}

function listenToDeletePoem(author, title) {
    const trash = document.querySelector('.fa-trash-alt');
    if (trash) {
        console.log("trying to delete now");
        trash.addEventListener('click', () => {
            deletePoem(author, title);
            showDeletedMessage();
        });
    }
}

function showDeletedMessage() {
    const trash = document.querySelector('.fa-trash-alt');
    trash.textContent = 'Deleted';
}

displaySavedPoemsAndListen();
const heart = document.querySelector('.fa-heart');
heart.addEventListener('click', () => {
    displaySavedPoemsAndListen();
    colorHeart();
    uncolorBubble();
});

const bubble = document.querySelector('.fa-comment-dots');
bubble.addEventListener('click', () => {
    displayContact();
    colorBubble();
    uncolorHeart();
});
