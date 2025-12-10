import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY

export async function POST(req: NextRequest) {
    if (!apiKey) {
        return NextResponse.json(
            { error: "issing GEMINI_API_KEY" },
            { status: 500 }
        );
    }

    const ai = new GoogleGenAI({ apiKey });

    let body: { prompt?: string } = {};
    try { 
        body = await req.json();
    } catch {

    }

    const prompt = body.prompt ?? "";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
            You are playing a fun party game. 
            Prompt: "${prompt}"
            Write one short, funny answer to this prompt. 
            Rules: 
            - Under 120 chaacters
            - Answers to be one word or short phrases
            - PG-13
            - No Slurs, no explicit exual content
            - No mention of AI, coding or software
            - Output only the answer text, nothing else
            - Do not repeat previously inputted answers`,
        });

        const text = 
            response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

        if (!text) {
            return NextResponse.json(
                { error: "No Answer Generated"},
                { status: 500 }
            );
        }

        return NextResponse.json({ answer: text});
    } catch (err) {
        console.error("AI answer error: ", err);
        return NextResponse.json(
            { error: "Failed to generate AI Answer" },
            { status: 500 }
        );
    }
}