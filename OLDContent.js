
// Read user's homepage videos (whatever number, say 15 or 20)
// Make API calls to get their slant
// Check what user inputted as their desired slant
// 1) Change to a video from that bin and play it 
// 2) Go to homepage again and calculate slants
// Do steps 1) and 2) in a while loop till desired bin is reached in step 2)
// Display most extreme video seen so far and least extreme video seen so far (left and right)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getHomepage(){
    try {
      document.getElementById('logo-icon').click()
    }
    catch (exception_var) {
      window.location.replace('https://www.youtube.com/')
    }

    await sleep(5*1000);

    videos = getVideos('//div[@id="contents"]/ytd-rich-item-renderer');
    return videos;

}

function getElementsByXPathHelper(xpath) {
    var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    return result;
}

function getVideos(xpath) {
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


//function youtube_parser(url){
//    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
//    var match = url.match(regExp);
//    return (match&&match[7].length==11)? match[7] : false;
//}

async function mainFunc() {

    if (window.location.href == 'https://www.anshumanc.com/') {

        console.log("Going to go to homepage now");
        vids = getHomepage();
        for (i = 0; i < vids.length; i++) {
            window.location.replace(vids[i]);
            await sleep(5*1000);
        }

        //window.location.replace('https://www.anshumanc.com/')
    }
}

mainFunc();
