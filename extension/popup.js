/**
 * This JS file only runs when the popup.html is open. It should handle all the logic for the popup.html
 */

// Request background.js if there are any data to analyze
chrome.runtime.sendMessage({ message: "what-to-analyze" });

let analyze = document.getElementById("analyze-btn");

analyze.addEventListener("click", async () => {
  chrome.runtime.sendMessage({ message: "analyze-text" }); // Request data from background.js
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.message === "analyzed-text") {
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
      p.innerHTML = `There are ${request.data.toAnalyze} page(s) to analyze for the host www.${request.data.host}.`;
      msg.appendChild(p);
    }
  }
});
