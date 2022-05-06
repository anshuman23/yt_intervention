var slider = document.getElementById("ideo_slider");
var output = document.getElementById("ideo_choice");
output.innerHTML = "Center";

function num2text(number) {
    var ideo_text = '';
    switch(number){
        case '1':
            ideo_text = 'Left';
            break;
        case '2':
            ideo_text = 'Center-Left';
            break;
        case '3':
            ideo_text = 'Center';
            break;
        case '4':
            ideo_text = 'Center-Right';
            break;
        case '5':
            ideo_text = 'Right';
            break;
    }
    //console.log(ideo_text);
    return ideo_text;
}


slider.oninput = function() {
    var ideo_text = num2text(this.value);
    //console.log(ideo_text);
    output.innerHTML = ideo_text;
}


document.addEventListener('DOMContentLoaded', function () {
    var checkbox = document.querySelector('input[type="checkbox"]');
    chrome.storage.local.get('enabled', function (result) {
        if (result.enabled != null) {
            checkbox.checked = result.enabled;
        }
    });

    chrome.storage.local.get('mean_slant', function (result) {
        if (result.mean_slant != null) {
            let score_val = result.mean_slant;
            console.log(score_val);
            document.getElementById("slant_field").textContent = 'Latest Homepage Slant: ' + score_val;
        }
    });

});


document.querySelector("input[type=checkbox]").addEventListener("change", function() {
    console.log("Toggle: " + this.checked);
    console.log("Ideology: " + output.innerHTML);

    chrome.storage.local.set({ 'enabled': this.checked }, function () {
        console.log("toggle state stored locally");
    });

    msg_obj = {"toggle_state": this.checked, "ideology": output.innerHTML};
    chrome.runtime.sendMessage(msg_obj, function(response) {
        console.log("Response: ", response);
    
    });

}, false);


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request);
        if (request.msg === "TOGGLE_OFF") {
            document.getElementById("toggle_switch").checked = false;
        }
    }
);
