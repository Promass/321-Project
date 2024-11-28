/**
 * This JS file will be like the brain of the extension. It will act like a session manager for the extension.
 * Even if we change website this session will persist. Any data here will be kept until the browser is closed.
 * It is best to make API calls from here.
 */
import { analyzePolicy } from './apiFunctions.js';

let host = "";
let texts = {};

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message === "privacy-policy-found") {
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
    await analyzePolicy(texts[request.data.page])
        .then(result => {
          const removedMarkdownResult = result.response.candidates[0].content.parts[0].text.replace(/`/g, "").replace(/^json\s+/i, '');
          const analysisJson = JSON.parse(removedMarkdownResult)

          const analysisData = analysisJson.concerns.map((concern) => ({
            policy: concern.description,
            threatLevel: concern.risk_level,
          }));

          chrome.runtime.sendMessage({
            // Send data to popup.js
            message: "analyzed-text",
            data: {
              analysis: analysisData
            },
          });
        })
        .catch(error => {
          console.error('Error analyzing policy:', error);
        });
    // Data request from popup.js

  } else if (request.message === "what-to-analyze") {
    // Data request from popup.js
    chrome.runtime.sendMessage({
      // Send data to popup.js
      message: "things-to-analyze",
      data: { host: request.data.host, toAnalyze: Object.keys(texts).length },
    });
  }
});
