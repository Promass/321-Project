import { GoogleGenerativeAI } from "./libs/@google/generative-ai/dist/index.mjs";
import { KEY } from "./config.js";
//manually resolve dependencies

//queries gemini to analyze the privacy policy
export async function analyzePolicy(privacyPolicy) {
  const genAI = new GoogleGenerativeAI(KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = createPrompt(privacyPolicy);

  return await model.generateContent(prompt);
}

//constructs the prompt using the extracted privacy policy
export function createPrompt(privacyPolicy) {
  return (
    "Analyze the following text for potential privacy concerns:\n" +
    "\n" +
    ` ${privacyPolicy}` +
    "\n" +
    "Identify any sections related to data collection, sharing, retention, or security.\n" +
    "\n" +
    "Provide a JSON output with the following structure:\n" +
    "\n" +
    "JSON\n" +
    "{\n" +
    '    "concerns": [\n' +
    "        {\n" +
    '            "description": "Brief description of the concern",\n' +
    '            "risk_level": "High/Medium/Low"\n' +
    "        },\n" +
    "        ...\n" +
    "    ]\n" +
    "}\n" +
    "Use code with caution.\n" +
    "\n" +
    "Example Input:\n" +
    "\n" +
    "This website collects your email address to send you newsletters. We may share your email address with our marketing partners. Your data is stored on our servers for 5 years.\n" +
    "\n" +
    "Example Output:\n" +
    "\n" +
    "JSON\n" +
    "{\n" +
    '    "concerns": [\n' +
    "        {\n" +
    '            "description": "Email address is collected and shared with third-party marketing partners.",\n' +
    '            "risk_level": "Medium"\n' +
    "        },\n" +
    "        {\n" +
    '            "description": "Data is retained for 5 years, which may be longer than necessary.",\n' +
    '            "risk_level": "Low"\n' +
    "        }\n" +
    "    ]\n" +
    "}"
  );
}
