chrome.browserAction.onClicked.addListener(clickFunc);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function getHomepage(tab){
    console.log("Executing getHomepage function in background...");
    chrome.tabs.executeScript(tab.id, {file: "get_homepage.js"});
}


function beginVideoCollection(tab) {
    console.log("Executing getVideos function in background...");
    chrome.tabs.executeScript(tab.id, {file: "get_videos.js"});
}


function playVideo(tab, vid_url) {
    url_json = { link : String(vid_url) };
    chrome.tabs.executeScript(tab.id, {
    code: 'var video_obj = ' + JSON.stringify(url_json)}, function() {
    chrome.tabs.executeScript(tab.id, {file: 'play_video.js'});
    });
}


async function clickFunc(tab) {
    console.log("Executing main function..");
    getHomepage(tab);
    await sleep(2*1000);
    beginVideoCollection(tab);
}


async function playAllVideos(vids, seconds2watch) {
    for (i = 0; i < vids.length; i++) {
        playVideo(vids[i]);
        await sleep(seconds2watch*1000);
    }
}


function urlToID(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}


async function getSlant(video_url) {
   var v_id = urlToID(video_url);
   console.log(v_id);
   // Change the API later to rostam or use the file containing videos->slants
   let response = await fetch('https://csrng.net/csrng/csrng.php?min=0&max=1')
   return await response.json();
}


chrome.runtime.onMessage.addListener(async function(msg, sender, sendResponse) {
    var videos = msg;
    sendResponse("Got videos from injected script...");
    console.log(videos);
    //playAllVideos(videos, 5);

    var scores_list = [];
    var mean_score = 0;
    var actual_count = 0
    for (i = 0; i < videos.length; i++) {
        const js_resp = await getSlant(videos[i]);
        // Add here ```var score = js_resp.slant``` and remove following line:
        var score = js_resp[0].random;
        console.log(score);
        if (score >= 0.0 && score <= 1.0) {
            scores_list.push(score);
            mean_score = mean_score + score;
            actual_count = actual_count + 1;
        }
    }

    mean_score = mean_score / actual_count;
    console.log(mean_score);
    var epsilon = 0.1; //Set threshold according to your need
    var time2watch4 = 5;

    if (Math.abs(mean_score - 0.0) > epsilon) {
        // Read video to play from curated list here
        var vid2play = 'https://www.youtube.com/watch?v=eB2OpurOFhk';
        playVideo(sender.tab, vid2play);
        await sleep(time2watch4 * 1000);

    } else {
        getHomepage(sender.tab);
        return;
    }

    clickFunc(sender.tab);

});


