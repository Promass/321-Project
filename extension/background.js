/**
 * This JS file will be like the brain of the extension. It will act like a session manager for the extension.
 * Even if we change website this session will persist. Any data here will be kept until the browser is closed.
 * It is best to make API calls from here.
 */

let host = "";
let texts = {};

chrome.runtime.onMessage.addListener((request) => {
  if (request.message === "privacy-policy-found") {
    // Get data from content.js
    if (!host) {
      host = request.data.host;
      texts[request.data.page] = request.data.text;
    } else if (host !== request.data.host) {
      host = request.data.host;
      texts[request.data.page] = request.data.text;
    } else {
      texts[request.data.page] = request.data.text;
    }
  } else if (request.message === "analyze-text") {
    // Data request from popup.js
    chrome.runtime.sendMessage({
      // Send data to popup.js
      message: "analyzed-text",
      data: {
        analysis: [
          { policy: "Policy 1", threatLevel: 1 },
          { policy: "Policy 2", threatLevel: 3 },
        ],
      },
    });
  } else if (request.message === "what-to-analyze") {
    // Data request from popup.js
    chrome.runtime.sendMessage({
      // Send data to popup.js
      message: "things-to-analyze",
      data: { host, toAnalyze: Object.keys(texts).length },
    });
  }
});
