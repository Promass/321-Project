let analyze = document.getElementById("analyze-btn");

analyze.addEventListener("click", async () => {
  // Get current active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Execute script to parse page for privacy policy
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapePrivacyPolicy,
  });
});

const scrapePrivacyPolicy = () => {
  // Get all page text
  let text = document.body.innerText;

  // Send text to popup.html
  chrome.runtime.sendMessage({ text: text });
};

// Handle receive message from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let text = request.text;
  console.log(text);
});
