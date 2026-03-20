import { GoogleGenerativeAI } from "@google/generative-ai";
import type { TriageData } from "../types";

const SYSTEM_PROMPT = `
You are an Emergency Triage AI. Analyze the following messy, panicked input from a bystander. Ignore the emotional 'noise.' Extract the core medical facts.

RETURN ONLY A VALID JSON OBJECT, WITHOUT MARKDOWN FORMATTING OR CODE BLOCKS.
Do not wrap it in \`\`\`json. Just the raw JSON object.

The JSON MUST match this exact schema:
{
    "severity_score": <number 1-10>,
    "incident_type": "<short descriptive string>",
    "patient_status": "<short valid status>",
    "action_steps": ["<Imperative verb step 1>", "<Step 2>", "<Step 3>"],
    "priority": "<Critical | Urgent | Stable>",
    "summary": "<1-sentence summary>",
    "vitals_detected": ["<unconscious>", "<bleeding>", "<etc>"],
    "immediate_actions": ["<Imperative verb step 1>", "<Step 2>", "<Step 3>"],
    "hospital_payload": {
        "type": "<Trauma or other type>",
        "severity": <number 1-10>,
        "eta_requirement": "<Immediate, Fast, Normal>"
    }
}
`;

export const processCrisisInput = async (input: string): Promise<TriageData> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
        throw new Error(
            "Missing Gemini API Key. Please add VITE_GEMINI_API_KEY to your .env file.",
        );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Automatically upgraded to gemini-2.5-flash based on your API key's available models
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const combinedPrompt = `${SYSTEM_PROMPT}\n\n=== MESSY INPUT ===\n${input}`;

        // Attempting completion using the latest generation SDK
        const result = await model.generateContent(combinedPrompt);
        const textResponse = result.response.text();

        // Ensure we parse even if occasionally getting markdown blocks
        const cleanedJson = textResponse
            .replace(/^\s*```[a-z]*\n/, "")
            .replace(/\n```\s*$/, "")
            .trim();

        return JSON.parse(cleanedJson) as TriageData;
    } catch (error) {
        console.error("Gemini Parsing Error:", error);
        throw new Error(
            "Failed to parse triage data. The AI might have returned malformed data or API key is invalid.",
        );
    }
};
