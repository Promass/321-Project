/**
 * This JS file only runs when the popup.html is open. It should handle all the logic for the popup.html
 */

// Request background.js if there are any data to analyze
// Fetch the host of the current tab when the popup opens
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  let activeTab = tabs[0];
  let host = new URL(activeTab.url).hostname;
  let page = new URL(activeTab.url).pathname;

  chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        func: function () {
          return document.body.innerText;
        },
      },
      async (injectionResults) => {
        const innerText = injectionResults[0].result;
        const cleanedText = cleanText(innerText);
        const hasKeyword = containsKeyword(cleanedText);

        if (hasKeyword) {
          await chrome.runtime.sendMessage({
            message: "privacy-policy-found",
            data: {host, page, text: cleanedText},
          });

          chrome.runtime.sendMessage({
            message: "what-to-analyze",
            data: { host },
          });
        }
      }
  );
});

let analyze = document.getElementById("analyze-btn");

analyze.addEventListener("click", async () => {
  const msg = document.getElementById("msg");
  const loadingMessage = document.createElement("p");
  loadingMessage.innerHTML = "Fetching data... Please wait.";
  msg.appendChild(loadingMessage);
  
  analyze.style.display = "none";

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let activeTab = tabs[0];
    let page = new URL(activeTab.url).pathname;

    chrome.runtime.sendMessage({ message: "analyze-text", data: { page } });
  });
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.message === "analyzed-text") {
    const msg = document.getElementById("msg");
    msg.innerHTML = "";

    // Data received from background.js
    const table = document.getElementById("result-table");
    const tbody = document.createElement("tbody");

    // request.data.analysis = [{ policy: "something", threatLevel: 1}, { policy: "something", threatLevel: 1} ...]
    for (const analysis of request.data.analysis) {
      const tr = document.createElement("tr");
      const td1 = document.createElement("td");
      const td2 = document.createElement("td");

      td1.innerHTML = analysis.policy;
      td2.innerHTML = analysis.threatLevel;

      tr.appendChild(td1);
      tr.appendChild(td2);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    table.style.display = "block";
  } else if (request.message === "things-to-analyze") {
    const msg = document.getElementById("msg");
    msg.innerHTML = "";

    if (request.data.toAnalyze == 0) {
      const p1 = document.createElement("p");
      const p2 = document.createElement("p");
      p1.innerHTML = "No data to analyze.";
      p2.innerHTML =
        "Please keep visiting the other pages of the website (specialy policy pages) to extract info for analysis.";
      msg.appendChild(p1);
      msg.appendChild(p2);
    } else {
      analyze.style.display = "block";
      const p = document.createElement("p");
      p.innerHTML = `There are ${request.data.toAnalyze} page(s) to analyze for the host ${request.data.host}.`;
      msg.appendChild(p);
    }
  }
});

function cleanText(rawText) {
  let cleanedText = rawText
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .replace(/\n\s*\n/g, "\n") // Remove multiple blank lines
      .trim(); // Trim leading and trailing spaces

  return cleanedText;
}

function containsKeyword(text) {
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      return true;
    }
  }

  return false;
}

const keywords = [
  "Privacy",
  "privacy",
  "Policy",
  "policy",
  "Data Protection",
  "data protection",
  "Personal Data",
  "personal data",
  "Confidentiality",
  "confidentiality",
  "Anonymity",
  "anonymity",
  "Encryption",
  "encryption",
  "Consent",
  "consent",
  "Security",
  "security",
  "Terms",
  "terms",
  "Conditions",
  "conditions",
  "Compliance",
  "compliance",
  "Governance",
  "governance",
  "Agreement",
  "agreement",
  "Cookies",
  "cookies",
  "Disclosure",
  "disclosure",
  "Retention",
  "retention",
];