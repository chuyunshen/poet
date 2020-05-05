import {getTodayDate} from './utils.js'

/* Returns true if a poem is already liked. False, otherwise.
 */
export function isAlreadySaved(author, title) {
    return new Promise ((resolve, reject) => {
        chrome.storage.sync.get(['saved_poems'], function(result) {
            for (let pair of result['saved_poems']) {
                if (pair[0] == author && pair[1] == title) {
                    resolve(true);
                    return;
                }
            }
            resolve(false);
        });
    })
}

/* Returns a promise with saved poems.
 */
export function getSavedPoems() {
    return new Promise ((resolve, reject) => {
        chrome.storage.sync.get(['saved_poems'], function(result) {
            resolve(result['saved_poems']);
        });
    })
};

/* Saves a given poem to Chrome storage.
 */
export function savePoem(author, title) {
    chrome.storage.sync.get(['saved_poems'],
        function(data) {
            update(data['saved_poems']);
        }
    );

    function update(array) {
        if (typeof array === 'undefined') {
            array = [];
        }
        array.push([author, title]);
        chrome.storage.sync.set({"saved_poems":array}, function() {
            console.log("Saved poem");
        });
    }
};

/* Returns the lastest date when a "today" poem is saved.
 */
export function getLatestDate() {
    return new Promise((resolve, reject) => {

        let result = "some random string";
        chrome.storage.sync.get(['today'],
            function(data) {
                if (data['today']) {
                    result = data['today'].date;
                    console.log(result);
                    resolve(result);
                }
            });
    });
};

/* Returns today's poem.
 */
export function getTodayPoem() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['today'],
        function(data) {
            resolve(data['today'].poem);
        });
    });
};

/* Clears today's poem. A helper for testing.
 */
export function clearTodayPoem() {
    return new Promise((resolve, reject) => {

        chrome.storage.sync.get(['today'],
            function(data) {
                update(data['today']);
            }
        );

        function update(object) {
            chrome.storage.sync.set({'today': {}}, function() {
                console.log("clear today poem");
                resolve();
            });
        };
    });
};

/* Saves today's poem in Chrome storage.
 */
export function setTodayPoem(author, title, lines) {
    chrome.storage.sync.get(['today'],
        function(data) {
            update(data['today']);
        }
    );

    function update(object) {
        object = {
            date: getTodayDate(),
            poem: {author, title, lines}
        }
        chrome.storage.sync.set({'today': object}, function() {
            console.log(object);
            console.log("Saved today's poem");
        });
    }
};

/* Deletes a poem from saved poems.
 */
export function deletePoem(author, title) {
    chrome.storage.sync.get(['saved_poems'],
        function(data) {
            update(data['saved_poems']);
        }
    );

    function update(array) {
        if (typeof array === 'undefined') {
            return;
        }
        for (const pair_index in array) {
            if (array[pair_index][0] == author &&
                array[pair_index][1] == title) {
                array.splice(pair_index, 1);
                break;
            }
        }
        chrome.storage.sync.set({"saved_poems":array}, function() {
            console.log("Removed from saved poems");
        });
    }
};
