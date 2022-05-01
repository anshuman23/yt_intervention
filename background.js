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

function playVideo(vid_url) {
    url_json = { link : String(vid_url) };
    chrome.tabs.executeScript(null, {
    code: 'var video_obj = ' + JSON.stringify(url_json)}, function() {
    chrome.tabs.executeScript(null, {file: 'play_video.js'});
    });

}


async function clickFunc(tab) {

    console.log("Executing main function..");
    getHomepage(tab);
    await sleep(2*1000);
    beginVideoCollection(tab);
    
    //console.log(vids.slice());
    //console.log(vids.length);
    
    //for (i = 0; i < vids.length; i++) {
        //window.location.replace(vids[i]);
        //playVideo(tab, vids[i]);
        //await sleep(5*1000);
    //}
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
   const userAction = async () => {
   const resp = await fetch('https://rostam.idav.ucdavis.edu/noyce/getSlant/' + String(v_id));
   const resp_js = await resp.json();
   var score = resp_js.slant;
   return score;
  }
}


chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    var videos = msg;
    sendResponse("Got videos from injected script...");
    console.log(videos);
    playAllVideos(videos, 5);
    //for (i = 0; i < videos.length; i++) {
    //    console.log(getSlant(videos[i]));
    //}

});


