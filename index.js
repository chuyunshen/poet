//TODO: use today's date as a key in chrome storage
import {savePoem, deletePoem} from './storage.js';
import {appendLineBreaks} from './utils.js'
const MAX_LINE = 30;
const COLORS = ['#fbf1c7', '#94951A', '#D79921', '#458588',
    '#B16286', '#689D6A', '#D65D0E'];

var url = 'https://en.wikipedia.org/w/api.php';

var params = {
    action: "query",
    prop: "pageimages|pageterms",
    titles: "",
    format: "json",
    fomatversion: "2",
    piprop: "thumbnail",
    pithumbsize: "600",
};


/* Helper for generating random integer
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/* Displays a random poem fetched from poetryDB.
 */
async function displayRandomPoem(authorToDisplay,
    titleToDisplay, poemWrapper) {
    let response;
    let json;
    let author;
    let title;
    let lineCount = 200;
    let errorOccured = true;
    while (lineCount > MAX_LINE || errorOccured) {
        try {
            // Get random author
            response = await fetch(
                'http://poetrydb.org/author',
                { mode: 'cors' },
            );
            json = await response.json();
            const authors = json.authors;
            author = authors[getRandomInt(authors.length)];

            // Get random title with given author
            response = await fetch(
                `http://poetrydb.org/author/${author}/title`,
                { mode: 'cors' },
            );
            const titles = await response.json();
            title = titles[getRandomInt(titles.length)].title;

            // Get random poem
            response = await fetch(
                `http://poetrydb.org/title/${title}`,
                { mode: 'cors'},
            );
            json = await response.json();
            console.log(json);
            lineCount = json[0].lines.length;
            console.log(lineCount);
            errorOccured = false;
        } catch (error) {
            console.log(error);
        }
    }
    const lines = json[0].lines;

    // display
    titleToDisplay.textContent = title;
    authorToDisplay.textContent = author;

    organizePoemLayout(titleToDisplay, authorToDisplay,
        poemWrapper, lines);
}

/* Helper function to organize the layout.
 * Split given poem into two panes if the poem is longer
 * than MAX_LINE / 2 lines
 */
function organizePoemLayout(titleToDisplay,
    authorToDisplay, poemWrapper, lines) {
    const lineCount = lines.length;

    // console.log(window.innerWidth);
    // console.log(window.innerHeight);
    console.log(lineCount);
    if (lineCount > MAX_LINE / 2) {
        let leftPanel = makePanel();
        let rightPanel = makePanel();
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


/* Fills the heart button and add the given poem to
 * favourited poems
 */
function like(authorToDisplay, titleToDisplay) {
    fillHeart();
    const author = authorToDisplay.textContent;
    const title = titleToDisplay.textContent;
    savePoem(author, title);
}

/* Unfills the heart button and remove the given poem from
 * favourited poems
 */
function unlike(authorToDisplay, titleToDisplay) {
    unfillHeart();
    let author = authorToDisplay.textContent;
    let title = titleToDisplay.textContent;
    deletePoem(author, title);
}

async function displayPoetImage(authorToDisplay, poemWrapper) {
    let author = authorToDisplay.textContent;
    // Error will occur if there isn't a wiki photo for that author
    console.log(author);
    params.titles = author;
    url = url + "?origin=*";
    Object.keys(params).forEach((key) => {
        url += "&" + key + "=" + params[key];});

    console.log(url);
    let response;
    let json;
    try {
        response = await fetch(url);
        json = await response.json();
        console.log(json);
        var pages = json.query.pages;
        for (var page in pages) {
            console.log(pages[page].thumbnail.source);
            const imageUrl = pages[page].thumbnail.source;
            const image = document.createElement('img');
            image.src = imageUrl;
            console.log(poemWrapper.lastChild);
            console.log(getComputedStyle(poemWrapper.lastChild).height);
            if (parseInt(getComputedStyle(poemWrapper.lastChild).height) + 250 > 600) {
                panel = makePanel();
                panel.appendChild(image);
                poemWrapper.appendChild(panel);
            } else {
                poemWrapper.lastChild.appendChild(image);
            }
            // randomize horizontal position
            image.style.cssFloat = getRandomInt(2) ? "left" : "right";
            // randomize vertical position
            if (getRandomInt(2)) {
                image.style.position = "absolute";
                image.style.bottom = "0";
            }
        }
    } catch(error) {
        console.log(error);
        return;
    }
}

// Randomly colourize one of the panels
function colorize() {
    const body = document.querySelector('body');
    const panels = Array.from(document.querySelectorAll('.panel'));
    const randInt = getRandomInt(panels.length);

    const position = getCoords(panels[randInt]);
    const xLeft = position.left;
    const xRight = position.right;
    console.log(xLeft);
    console.log(xRight);
    console.log(randInt);
    const randomColor = COLORS[getRandomInt(COLORS.length)];
    const selectedColors = getRandomInt(2) ?
        ["white", randomColor] : [randomColor, "white"];
    console.log(selectedColors);

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

// TODO: fix this
function getCoords(element) {
    const box = element.getBoundingClientRect();

    return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset,
        right: box.right + window.pageXOffset,
    };
}

async function displayAll(authorToDisplay, titleToDisplay, poemWrapper) {
        await displayRandomPoem(authorToDisplay, titleToDisplay,
                poemWrapper);
        await displayPoetImage(authorToDisplay, poemWrapper);
            colorize();
}

var titleToDisplay = document.createElement('h1');
titleToDisplay.id = 'title';
var authorToDisplay = document.createElement('h2');
authorToDisplay.id = 'author';

const poemWrapper = document.querySelector('#poem-wrapper');

// execute displays in order
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
    titleToDisplay.innerHTML = '';
    authorToDisplay.innerHTML = '';
    poemWrapper.innerHTML = '';
    displayAll(authorToDisplay, titleToDisplay, poemWrapper);
});
