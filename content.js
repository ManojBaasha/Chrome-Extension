chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === "scrapeData") {
        sendResponse(scrapePage(msg.url));
    }
});

function scrapePage(url) {

}