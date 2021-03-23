chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.contentScriptQuery == "queryTitle") {
        const url = `http://poetrydb.org/title/${request.title}`;
        console.log(url);
        fetch(url)
                .then(response => response.json())
                .then(response => {
                    console.log("queryTitle", response);
                    sendResponse(response);
                })
                .catch(error => console.log("An error occurred when fetching " + url, error));
        return true;
    }
  });

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery == "queryAuthors") {
            const url = 'http://poetrydb.org/author';
            console.log(url);
            fetch(url)
                .then(response => response.json())
                .then(response => {
                    console.log("queryAuthors", response);
                    sendResponse(response);
                })
                .catch(error => console.log("An error occurred when fetching " + url, error));
            return true;
        }
  });

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery == "queryGivenAuthorGetTitles") {
            const url = `http://poetrydb.org/author/${request.author}/title`;
            console.log(url);
            fetch(url)
                .then(response => response.json())
                .then(response => {
                    console.log("author title", response);
                    sendResponse(response);
                })
                .catch(error => console.log("An error occurred when fetching " + url, error));
            return true;
        }
  });
  
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery == "queryAuthorImage") {
        let url = 'https://en.wikipedia.org/w/api.php';
        console.log(url);
        let params = {
            action: "query",
            prop: "pageimages|pageterms",
            titles: "",
            format: "json",
            fomatversion: "2",
            piprop: "thumbnail",
            pithumbsize: "600",
        };
        params.titles = request.author;
        url = url + "?origin=*";
        Object.keys(params).forEach((key) => {
            url += "&" + key + "=" + params[key];});

        fetch(url)
                .then(response => response.json())
                .then(response => {
                    console.log("author image", response);
                    sendResponse(response);
                })
                .catch(error => console.log("An error occurred when fetching " + url, error));
        return true;
        }
  });