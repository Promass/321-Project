/**
 * This JS file will be like the brain of the extension. It will act like a session manager for the extension.
 * Even if we change website this session will persist. Any data here will be kept until the browser is closed.
 * It is best to make API calls from here.
 */
import { analyzePolicy } from "./apiFunctions.js";

let host = "";
let texts = {};
let analysisData = [];
let prevTextsLength = 0;

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message === "privacy-policy-found") {
    if (host !== request.data.host) {
      host = request.data.host;
      texts = {};
      analysisData = [];
      prevTextsLength = 0;
    }
    texts[request.data.page] = request.data.text;
  } else if (request.message === "analyze-text") {
    if (request.data.host !== host || Object.keys(texts).length === 0) {
      chrome.runtime.sendMessage({
        message: "things-to-analyze",
        data: { host: request.data.host, toAnalyze: 0 },
      });
    } else {
      const combinedText = Object.values(texts).join("\n\n");

      await analyzePolicy(combinedText)
        .then((result) => {
          const removedMarkdownResult =
            result.response.candidates[0].content.parts[0].text
              .replace(/`/g, "")
              .replace(/^json\s+/i, "");
          const analysisJson = JSON.parse(removedMarkdownResult);

          analysisData = analysisJson.concerns
            .map((concern) => ({
              policy: concern.description,
              threatLevel: concern.risk_level,
            }))
            .sort((a, b) => {
              const levels = { High: 3, Medium: 2, Low: 1 };
              return levels[b.threatLevel] - levels[a.threatLevel];
            });

          prevTextsLength = Object.keys(texts).length;

          chrome.runtime.sendMessage({
            // Send data to popup.js
            message: "analyzed-text",
            data: {
              analysis: analysisData,
            },
          });
        })
        .catch((error) => {
          console.error("Error analyzing policy:", error);
        });
    }
  } else if (request.message === "what-to-analyze") {
    if (request.data.host !== host) {
      host = request.data.host;
      texts = {};
      analysisData = [];
      prevTextsLength = 0;
      chrome.runtime.sendMessage({
        message: "things-to-analyze",
        data: { host, toAnalyze: Object.keys(texts).length },
      });
    } else if (
      analysisData.length > 0 &&
      prevTextsLength === Object.keys(texts).length
    ) {
      chrome.runtime.sendMessage({
        // Send data to popup.js
        message: "analyzed-text",
        data: {
          analysis: analysisData,
        },
      });
    } else {
      // Data request from popup.js
      chrome.runtime.sendMessage({
        // Send data to popup.js
        message: "things-to-analyze",
        data: { host, toAnalyze: Object.keys(texts).length },
      });
    }
  }
});
