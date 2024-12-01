/**
 * This JS file only runs when the popup.html is open. It should handle all the logic for the popup.html
 */

// Request background.js if there are any data to analyze
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  let activeTab = tabs[0];
  let host = new URL(activeTab.url).hostname;

  chrome.scripting.executeScript(
    {
      target: { tabId: activeTab.id },
      func: () => {
        return;
      },
    },
    async () => {
      chrome.runtime.sendMessage({
        message: "what-to-analyze",
        data: { host },
      });
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

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let activeTab = tabs[0];
    let host = new URL(activeTab.url).hostname;

    chrome.runtime.sendMessage({ message: "analyze-text", data: { host } });
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
      p1.innerHTML = `No data to analyze for host ${request.data.host}.`;
      p2.innerHTML =
        "Please keep visiting the other pages of the website (especially policy pages) to extract info for analysis.";
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
