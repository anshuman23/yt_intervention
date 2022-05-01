function getElementsByXPathHelper(xpath) {
    var res = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    return res;
}

function toRun() {
    var videos = [];
    var x_results = getElementsByXPathHelper('//div[@id="contents"]/ytd-rich-item-renderer');
    while (node = x_results.iterateNext()) {
        const a = node.getElementsByTagName('a')[0];
        const href = a.getAttribute('href');
        if (href && href.startsWith('/watch?')) {
            videos.push('https://www.youtube.com' + href);
            console.log('https://www.youtube.com' + href);
        }
    }

    console.log(videos.length);

    //return videos;
    chrome.runtime.sendMessage(videos, function(response) {
    console.log("Response: ", response);
    });
}

toRun();


