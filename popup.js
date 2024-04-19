// Function to handle response from content script
function handleResponse(response) {
    console.log("Response received: ", response);
    var statusLabel = document.getElementById('statusLabel');
    statusLabel.innerHTML = 'Saving';
    // var important = importantContent(response);
    // var jsonString = JSON.stringify(important, null, 2);
    // var blob = new Blob([jsonString], { type: 'application/json' });
    // var url = URL.createObjectURL(blob);
    // console.log(url);
    saveComplete();
}

// Function to send message to content script to scrape data
function scrapeData() {
    var statusLabel = document.getElementById('statusLabel');
    statusLabel.innerHTML = 'Parse';
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log('Sending message to:\n' + tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id, { text: 'scrapeData', url: tabs[0].url }, handleResponse);
    });
}

// Function to handle completion of download
function saveComplete() {
    var statusLabel = document.getElementById('statusLabel');
    statusLabel.innerHTML = 'Saved';
    window.close();
}

// Attach click event listener to download button
document.getElementById('statusLabel').addEventListener('click', scrapeData);