const MAX_LINE = 40;
const COLORS = ["#fbf1c7", "cc241d", "#94951A", "#D79921","#458588",
            "#B16286","#689D6A", "#D65D0E"];

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function displayRandomPoem(authorToDisplay,
    titleToDisplay, poemWrapper) {
    let response;
    let json;
    let lineCount = 200;
    let author;
    let title;
    while (lineCount > MAX_LINE) {

        // Get random author
        response = await fetch(
            'http://poetrydb.org/author',
            {mode: 'cors'});
        json = await response.json();
        const authors = json.authors;
        author = authors[getRandomInt(authors.length)];

        // Get random title with given author
        response = await fetch(
            `http://poetrydb.org/author/${author}/title`,
            {mode: 'cors'})
        const titles = await response.json();
        title = titles[getRandomInt(titles.length)].title;

        // Get random poem
        response = await fetch(
            `http://poetrydb.org/title/${title}`,
            {mode: 'cors'});
        json = await response.json();
        console.log(json);
        lineCount = json[0].lines.length;
        console.log(lineCount);
    }
    const lines = json[0].lines;

    // display
    titleToDisplay.textContent = title;
    authorToDisplay.textContent = author;

    organizePoemLayout(titleToDisplay, authorToDisplay,
        poemWrapper, lines);
}

// Split given poem into two panes if it's long
function organizePoemLayout(titleToDisplay,
    authorToDisplay, poemWrapper, lines) {
    lineCount = lines.length;

    console.log(window.innerWidth);
    console.log(window.innerHeight);
    console.log(lineCount);
    if (lineCount > MAX_LINE / 2) {
        let leftPanel = makePanel();
        let rightPanel = makePanel();
        leftLines = lines.slice(0, MAX_LINE / 2);
        rightLines = lines.slice(MAX_LINE / 2, lineCount);
        leftPanel.textContent = appendLineBreaks(leftLines);
        rightPanel.textContent = appendLineBreaks(rightLines);
        poemWrapper.appendChild(leftPanel);
        poemWrapper.appendChild(rightPanel);
    } else {
        let panel = makePanel();
        panel.textContent = appendLineBreaks(lines);
        poemWrapper.appendChild(panel);
    }
}

function makePanel() {
    let panel = document.createElement('div');
    panel.classList.add("poem");
    panel.classList.add("panel");
    return panel;
}

function appendLineBreaks(lines) {
    let poem = "";
    for (line of lines) {
        poem = poem.concat(line);
        poem = poem.concat("\n");
    }
    return poem;
}

const titleToDisplay = document.querySelector('#title');
const authorToDisplay = document.querySelector('#author');
const poemWrapper = document.querySelector('#poem-wrapper');
displayRandomPoem(authorToDisplay, titleToDisplay, poemWrapper);
