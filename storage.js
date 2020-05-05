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
                console.log("actually remove it");
                array.splice(pair_index, 1);
                break;
            }
        }
        chrome.storage.sync.set({"saved_poems":array}, function() {
            console.log("Removed from saved poems");
        });
    }
};

