export function appendLineBreaks(lines) {
    let poem = "";
    for (const line of lines) {
        poem = poem.concat(line);
        poem = poem.concat("\n");
    }
    return poem;
}

