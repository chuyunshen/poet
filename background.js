console.log("background");
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("listening");
      if (request.contentScriptQuery == "randomPoem") {
        const url = `https://poetrydb.org/random`;
        fetch(url)
                .then(response => response.json())
                .then(response => {
                    console.log(response);
                    sendResponse(response);
                })
                .catch(error => console.log("An error occurred when fetching a random poem" + url, error));
        return true;
    }
  });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("listening2");
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
        console.log("listening3");
        if (request.contentScriptQuery == "queryAuthorImage") {
        let url = 'https://en.wikipedia.org/w/api.php';
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