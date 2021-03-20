import {savePoem, deletePoem, getLatestDate, getTodayPoem, setTodayPoem,
    clearTodayPoem, isAlreadySaved} from './storage.js';
import {appendLineBreaks, getTodayDate, getRandomInt} from './utils.js';
import {MAX_LINE, COLORS} from './config.js';


async function sendMessage(item) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(item, response => resolve(response))
    });
}

/* Displays a random poem fetched from poetryDB.
 * If the poem is longer than the max number of lines defined in config.js,
 * the function requeries.
 * Returns a promise along with the poem lines.
 */
async function displayRandomPoem(authorToDisplay,
    titleToDisplay, poemWrapper) {
    return new Promise(async (resolve) => {
        let response, json, author, title;
        let lineCount = 200;
        let errorOccured = true;
            try {
                // Get random author
                json = await sendMessage({contentScriptQuery: "queryAuthors"});
                const authors = json.authors;
                author = authors[getRandomInt(authors.length)];
                console.log("rand author", author);
                // Get random title with given author
                const titles = await sendMessage({contentScriptQuery: "queryGivenAuthorGetTitles", author});
                title = titles[getRandomInt(titles.length)].title;

                // Get random poem
                json = await sendMessage({contentScriptQuery: "queryTitle", title});
                lineCount = json[0].lines.length;
                errorOccured = false;
            } catch (error) {
                console.error(error);
            }
        const lines = json[0].lines;

        // display
        titleToDisplay.textContent = title;
        authorToDisplay.textContent = author;
        organizePoemLayout(titleToDisplay, authorToDisplay,
            poemWrapper, lines);
        resolve(lines);
    });
}

/* Helper function to organize the layout.
 * Split given poem into two panels if the poem is longer
 * than MAX_LINE / 2 lines
 */
function organizePoemLayout(titleToDisplay,
    authorToDisplay, poemWrapper, lines) {
    const lineCount = lines.length;

    if (lineCount > MAX_LINE / 2) {
        let leftPanel = makePanel();
        let rightPanel = makePanel();
        // Left panel will have title and author appended.
        leftPanel.appendChild(titleToDisplay);
        leftPanel.appendChild(authorToDisplay);
        const leftLines = lines.slice(0, MAX_LINE / 2);
        const rightLines = lines.slice(MAX_LINE / 2, lineCount);
        let leftText = makeBox();
        let rightText = makeBox();
        leftText.textContent = appendLineBreaks(leftLines);
        rightText.textContent = appendLineBreaks(rightLines);
        leftPanel.appendChild(leftText);
        rightPanel.appendChild(rightText);
        poemWrapper.appendChild(leftPanel);
        poemWrapper.appendChild(rightPanel);
    } else {
        let panel = makePanel();
        panel.appendChild(titleToDisplay);
        panel.appendChild(authorToDisplay);
        let text = makeBox();
        text.textContent = appendLineBreaks(lines);
        panel.appendChild(text);
        poemWrapper.appendChild(panel);
    }
}

function makePanel() {
    const panel = document.createElement('div');
    panel.classList.add("poem");
    panel.classList.add("panel");
    return panel;
}

function makeBox() {
    const panel = document.createElement('div');
    panel.classList.add("poem");
    panel.classList.add("box");
    return panel;
}

function fillHeart() {
    const heart = document.querySelector(".fa-heart");
    heart.classList.remove("far");
    heart.classList.add("fas");
}

function unfillHeart() {
    const heart = document.querySelector(".fa-heart");
    heart.classList.remove("fas");
    heart.classList.add("far");
}


/* Fills the heart button and save the poem to Chrome storage.
 */
function like(authorToDisplay, titleToDisplay) {
    fillHeart();
    const author = authorToDisplay.textContent;
    const title = titleToDisplay.textContent;
    savePoem(author, title);
}

/* Unfills the heart button and remove the given poem from
 * saved poems in Chrome storage.
 */
function unlike(authorToDisplay, titleToDisplay) {
    unfillHeart();
    let author = authorToDisplay.textContent;
    let title = titleToDisplay.textContent;
    deletePoem(author, title);
}

/* Queries the profile image of a given author's Wikipedia page and
 * displays it after the poem. No poet image will be displayed if the
 * wiki image cannot be found.
 */
async function displayPoetImage(authorToDisplay, poemWrapper) {
    let author = authorToDisplay.textContent;
    // Error will occur if there isn't a wiki photo for that author
    let json;
    try {
        json = await sendMessage({contentScriptQuery: "queryAuthorImage", author});
        const pages = json.query.pages;
        for (const page in pages) {
            const imageUrl = pages[page].thumbnail.source;
            const image = document.createElement('img');
            image.src = imageUrl;
            if (parseInt(getComputedStyle(poemWrapper.lastChild).height) + 250 > 600) {
                panel = makePanel();
                panel.appendChild(image);
                poemWrapper.appendChild(panel);
            } else {
                poemWrapper.lastChild.appendChild(image);
            }
            // randomize horizontal position
            image.style.cssFloat = getRandomInt(2) ? "left" : "right";
        }
    } catch(error) {
        // No poet image is found.
        return;
    }
}

/* Randomly colour the panels with colours from config.js.
 */
function colorize() {
    const body = document.querySelector('body');
    const panels = Array.from(document.querySelectorAll('.panel'));
    const randInt = getRandomInt(panels.length);
    const position = getCoords(panels[randInt]);
    const xLeft = position.left;
    const xRight = position.right;
    const randomColor = COLORS[getRandomInt(COLORS.length)];
    const selectedColors = getRandomInt(2) ?
        ["white", randomColor] : [randomColor, "white"];

    if (randInt == 0) {
        body.style.background =`linear-gradient(90deg,
            ${selectedColors[0]} ${xRight}px,
            ${selectedColors[1]} ${xRight}px)` ;
    } else if (randInt == 1) {
        body.style.background =`linear-gradient(90deg,
            ${selectedColors[0]} ${xLeft}px,
            ${selectedColors[1]} ${xLeft}px,
            ${selectedColors[1]} ${xRight}px,
            ${selectedColors[0]} ${xRight}px)` ;
    } else {
        body.style.background =`linear-gradient(90deg,
            ${selectedColors[0]} ${xLeft}px,
            ${selectedColors[1]} ${xLeft}px)` ;
    }
}

/* Returns an object of the elemnt's coordinates.
 */
function getCoords(element) {
    const box = element.getBoundingClientRect();
    return {
        left: box.left + window.pageXOffset,
        right: box.right + window.pageXOffset,
    };
}

/* Displays the given poem.
 */
function displayGivenPoem(authorToDisplay, titleToDisplay, poemWrapper,
    todayPoem) {
    authorToDisplay.textContent = todayPoem.author;
    titleToDisplay.textContent = todayPoem.title;
    organizePoemLayout(authorToDisplay, titleToDisplay, poemWrapper, todayPoem.lines);
}

/* This function first checks if there is a poem saved for today, if yes,
 * display today's poem. Otherwise, display a random poem.
 * Then the poet's image will be displayed and the page will be coloured.
 */
async function displayAll(authorToDisplay, titleToDisplay, poemWrapper) {
    // await clearTodayPoem();
    const today = getTodayDate();
    const lastestDate = await getLatestDate();
    if (today == lastestDate) {
        // If there is already a poem from today saved, fetch it from
        // Chrome storage
        const todayPoem = await getTodayPoem();
        displayGivenPoem(authorToDisplay, titleToDisplay, poemWrapper, todayPoem);
    } else {
        // otherwise, display a random poem and save it to today's poem in
        // chrome storage.
        let lines = await displayRandomPoem(authorToDisplay, titleToDisplay, poemWrapper);
        await setTodayPoem(authorToDisplay.textContent, titleToDisplay.textContent, lines);
    }
    await displayPoetImage(authorToDisplay, poemWrapper);
    colorize();
    // If a poem is already saved, turn the heart red.
    setHeartColor(authorToDisplay.textContent, titleToDisplay.textContent);
}

/* Sets the heart to unfilled or filled depending on if the poem has been
 * saved.
 */
async function setHeartColor(author, title) {
    const isSaved = await isAlreadySaved(author, title);
    if (isSaved) {
        fillHeart();
    } else {
        unfillHeart();
    }
}


/* Displays a new poem and its corresponding poet image in the case when
 * the refresh button is pressed.
 */
async function displayRefresh(authorToDisplay, titleToDisplay, poemWrapper) {
    titleToDisplay.innerHTML = '';
    authorToDisplay.innerHTML = '';
    poemWrapper.innerHTML = '';
    let lines = await displayRandomPoem(authorToDisplay, titleToDisplay, poemWrapper);
    await setTodayPoem(authorToDisplay.textContent, titleToDisplay.textContent, lines);
    await displayPoetImage(authorToDisplay, poemWrapper);
    colorize();
    setHeartColor(authorToDisplay.textContent, titleToDisplay.textContent);
}

navigator.serviceWorker.register('background.js').then(x => console.log('done', x));
var titleToDisplay = document.createElement('h1');
titleToDisplay.id = 'title';
var authorToDisplay = document.createElement('h2');
authorToDisplay.id = 'author';

const poemWrapper = document.querySelector('#poem-wrapper');

displayAll(authorToDisplay, titleToDisplay, poemWrapper);
const heart = document.querySelector(".fa-heart");
heart.addEventListener('click', () => {
    if (heart.classList.contains("far")) {
        like(authorToDisplay, titleToDisplay);
    } else {
        unlike(authorToDisplay, titleToDisplay);
    }
});

const refresh = document.querySelector(".fa-redo-alt");
refresh.addEventListener('click', () => {
    displayRefresh(authorToDisplay, titleToDisplay, poemWrapper);
});
