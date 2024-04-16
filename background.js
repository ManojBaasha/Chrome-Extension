chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tags) {
    chrome.action.setBadgeText({ text: message.tags.length.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
    chrome.storage.local.set({ tags: message.tags });
  }
});
