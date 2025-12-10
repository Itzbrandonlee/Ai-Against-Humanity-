import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI Prompt generation will fail.");
}

export const gemini = new GoogleGenAI({
    apiKey: apiKey || "",
});