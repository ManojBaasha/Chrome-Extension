chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === "scrapeData") {
        sendResponse(scrapePage(msg.url));
    }
});

function scrapePage(url) {
    var crs = courses();
    return crs
}

function courses(){
    var courses3 = document.querySelectorAll('div.classTitle');
    var courses4 = document.querySelectorAll('div.meeting, div.clearfix')
    console.log(courses3)
    console.log(courses4)
}

