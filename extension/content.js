/**
 * This JS file runs in the context of the current tab whether the popup is open or not.
 * Basically it will run as if the website is running this script.
 * It is best to use this script to interact with the website and get data from it
 * which will then be sent to either brackground.js or popup.js
 */

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

function containsKeyword(text) {
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      return true;
    }
  }

  return false;
}

function cleanText(rawText) {
  let cleanedText = rawText
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .replace(/\n\s*\n/g, "\n") // Remove multiple blank lines
    .trim(); // Trim leading and trailing spaces

  return cleanedText;
}

function scrapePrivacyPolicy() {
  if (document.body) {
    const innerText = document.body.innerText;
    const cleanedText = cleanText(innerText);
    const hasKeyword = containsKeyword(cleanedText);

    if (hasKeyword) {
      const host = window.location.hostname;
      const page = window.location.pathname;
      // Send the data to background.js
      chrome.runtime.sendMessage({
        message: "privacy-policy-found",
        data: { host, page, text: cleanedText },
      });
    }
  }
}

scrapePrivacyPolicy();

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    scrapePrivacyPolicy();
  }
});
