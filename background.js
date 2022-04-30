chrome.browserAction.onClicked.addListener(mainFunc);

//function sleep(ms) {
//    return new Promise(resolve => setTimeout(resolve, ms));
//}

function getHomepage() {
    try {
      document.getElementById('logo-icon').click()
    }
    catch (exception_var) {
      window.location.replace('https://www.youtube.com/')
    }
}


function getHomepageB(tab){
    console.log("Executing getHomepage function in background...");
    chrome.tabs.executeScript(tab.id, "homepage")

    videos = getVideos(tab);
    return videos;

}

function getElementsByXPathHelper(xpath) {
    var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    return result;
}

function getVideos(tab) {
    console.log("Executing getVideos function in background...");
    var videos = [];
    var results = getElementsByXPathHelper(xpath);
    while (node = results.iterateNext()) {
        const a = node.getElementsByTagName('a')[0];
        const href = a.getAttribute('href');
        if (href && href.startsWith('https://www.youtube.com/watch?')) {
            videos.push(href);
            console.log(href);
        }
    }

    return videos;
}


function mainFunc() {

    console.log("Executing main function..");
    vids = getHomepage();
    for (i = 0; i < vids.length; i++) {
            window.location.replace(vids[i]);
            //await sleep(5*1000);
    }
}
