'use strict';

function handleResponse(data) {
    console.log(data);
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.action === 'sendData') {
        handleResponse(msg.data);
    }
});
