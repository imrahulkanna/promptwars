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
    // Model explicitly targeting 2.5 flash for max efficiency
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Basic Input Sanitization (XSS Protection for "messy text")
    const sanitizedInput = input
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/{/g, "&#123;")
        .replace(/}/g, "&#125;");

    // Short input validation
    if (sanitizedInput.trim().length < 5) {
         throw new Error("Input too short to analyze. Please provide more details about the emergency.");
    }

    try {
        const combinedPrompt = `${SYSTEM_PROMPT}\n\n=== MESSY INPUT ===\n${sanitizedInput}`;

        const result = await model.generateContent(combinedPrompt);
        const textResponse = result.response.text();

        const cleanedJson = textResponse
            .replace(/^\s*```[a-z]*\n/, "")
            .replace(/\n```\s*$/, "")
            .trim();

        return JSON.parse(cleanedJson) as TriageData;
    } catch (error) {
        console.error("Gemini Parsing/API Error:", error);
        
        // Fallback UI/Data if the API fails or returns invalid JSON
        return {
            severity_score: 10,
            incident_type: "Unknown Critical Emergency",
            patient_status: "Unconfirmed - Treat as Critical",
            action_steps: [
                "Ensure scene safety before approaching.",
                "Call 911 or local emergency services immediately.",
                "Do not move the patient unless they are in immediate danger.",
                "Stay with the patient until help arrives."
            ],
            priority: "Critical",
            summary: "Automated analysis failed. Defaulting to critical emergency protocols. Manual triage required.",
            vitals_detected: ["unknown"],
            immediate_actions: ["Call 911", "Ensure Safety"],
            hospital_payload: {
                type: "Unknown trauma/medical event",
                severity: 10,
                eta_requirement: "Immediate"
            }
        };
    }
};
