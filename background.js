//chrome.browserAction.onClicked.addListener(clickFunc);

chrome.tabs.onCreated.addListener(clickFunc);

let user_choice = ''; //global variable for user's choice of ideology
let time2watch4 = 5; //global variable indicating seconds to watch each intervention video for
let toggle = false; //global variable indicating whether user has turned on intervention or not

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
    if (!(tab.url.startsWith('https://www.youtube.com/') || tab.pendingUrl.startsWith('http://www.youtube.com/'))) { //Nothing to do, we are not on YouTube
        return;
    }

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
   ////// Change the API later to rostam or use the file containing videos->slants //////
   let response = await fetch('https://csrng.net/csrng/csrng.php?min=0&max=1')
   return await response.json();
}

async function readFile(file_url) {
    let response = await fetch(file_url);
    return await response.json();
}


function getTargets(ideology_bin) {
    var targets = [];
    switch(ideology_bin) {
        case 'Right':
            targets.push(0.6);
            targets.push(1.0);
            break;
        case 'Left':
            targets.push(-0.6);
            targets.push(-1.0);
            break;
        case 'Center':
            targets.push(-0.2);
            targets.push(0.2);
            break;
        case 'Center-Right':
            targets.push(0.2);
            targets.push(0.6);
            break;
        case 'Center-Left':
            targets.push(-0.2);
            targets.push(-0.6);
            break;
    }
    return targets;
}


chrome.runtime.onMessage.addListener(async function(msg, sender, sendResponse) {
    // If message received is from popup script to start the intervention
    if (!(Array.isArray(msg))) {
        console.log(msg);
        sendResponse("Got the signal to either start/finish..");
        if (msg.toggle_state == false) { // Nothing to do here as intervention turned off by user
            toggle = false;
            return;
       }

       toggle = true;
       var new_tab_url = "http://www.youtube.com/";
       chrome.tabs.create({ url: new_tab_url });
       user_choice = msg.ideology;
       console.log(user_choice);
       return;
    }

    // If intervention turned off by user midway through video collection operations, we have to stop
    if (toggle == false) {
        return;
    }

    // If message received is from an injected content script giving us homepage videos to estimate mean slant
    var videos = msg;
    sendResponse("Got videos from injected script...");
    console.log(videos);
    //playAllVideos(videos, 5);

    var scores_list = [];
    var mean_score = 0;
    var actual_count = 0
    for (i = 0; i < videos.length; i++) {
        const js_resp = await getSlant(videos[i]);
        ////// Add here ```var score = js_resp.slant``` and remove following line: //////
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

    const file_link = chrome.runtime.getURL('./videos.json');
    console.log(file_link);
    const file_js = await readFile(file_link);
    var all_videos = file_js[user_choice];
    console.log(all_videos.length);

    var targets = getTargets(user_choice);

    if (mean_score >= targets[0] && mean_score <= targets[1]) {
        getHomepage(sender.tab);
        console.log("Intervention Complete...");
        toggle = false; // Intervention complete, set global toggle state variable to off
        // Send message to popup script to turn toggle off at the UI side
        chrome.runtime.sendMessage({msg: "TOGGLE_OFF"});
        return;
    } else {
        // Read video to play from curated list for that ideology here
        var vid2play = 'https://www.youtube.com/watch?v=' + all_videos[Math.floor(Math.random()*all_videos.length)];
        playVideo(sender.tab, vid2play);
        await sleep(time2watch4 * 1000);
    }

    clickFunc(sender.tab);

});


