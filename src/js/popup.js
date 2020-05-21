import {deletePoem, getSavedPoems} from './storage.js';
import {appendLineBreaks} from './utils.js';
import {WELCOME_MESSAGE} from './config.js';

/* Displays all the saved poems.
 */
async function displaySavedPoems() {
    return new Promise (async (resolve) => {
        const poemList = await getSavedPoems();
        if (!poemList) {
            const popup = document.querySelector('#popup');
            let welcomeMessage = document.createElement('div');
            welcomeMessage.id = 'welcome';
            welcomeMessage.textContent = WELCOME_MESSAGE;
            popup.appendChild(welcomeMessage);
        }
        for (const poem of poemList) {
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
        resolve();
    });
};

/* Displays a single poem with given author and title, queried from poetryDB.
 */
async function displayPoem(author, title) {
    let lines;
    try {
        const response = await fetch(
            `http://poetrydb.org/title/${title}`,
            { mode: 'cors'},
        );
        const json = await response.json();
        const lineCount = json[0].lines.length;
        lines = json[0].lines;
    } catch (error) {
        console.error(error);
        lines = "An error occured. Please check your Internet connection."
    }
    organizePoemLayout(author, title, lines);
}

/* Organizes the layout of a single saved poem.
 */
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

/* Displays all the saved poems and listen for thumbnail clicks.
 * If a poem's thumbnail is clicked, the given poem will be displayed.
 * In the single poem view, if the trash can button is clicked, the
 * poem will be removed from saved poems.
 */
async function displaySavedPoemsAndListen() {
    let popup = document.querySelector('#popup');
    popup.innerHTML = '';
    await displaySavedPoems();
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(async (thumbnail) => {
        thumbnail.addEventListener('click', async () => {
            const title = thumbnail.children[0].innerText;
            const author = thumbnail.children[1].innerText;
            await displayPoem(author, title);
            listenToDeletePoem(author, title);
        });
    });
}

/* Displays contact information.
 */
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
}

function colorBubble() {
    const bubble = document.querySelector('.fa-comment-dots');
    bubble.style.color = '#455C7B';
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

/* If the trash can button is clicked, the poem will be removed
 * from the saved poems.
 */
function listenToDeletePoem(author, title) {
    const trash = document.querySelector('.fa-trash-alt');
    if (trash) {
        trash.addEventListener('click', () => {
            deletePoem(author, title);
            showDeletedMessage();
        });
    }
}

/* Displays "deleted" if the delete button is clicked.
 */
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
