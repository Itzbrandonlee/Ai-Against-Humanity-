import { NextRequest, NextResponse } from "next/server";
import { gemini } from "@/lib/gemini"

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const {roundIndex, theme } = body;

    try {
        const response = await gemini.models.generateContent({ 
            model: "gemini-2.5-flash",
            contents: [
                `You are generating a fun party game fill in the blank style prompt. 
                Rules: 
                - PG-13 humor
                - have the players enter in a funny answer to make the judge laugh
                - Under 140 characters 
                - Avoid references to AI, coding, or this project
                - If the theme is boring or irrelevant, ignore it
                - Output only the prompt, nothing else  
                - For the missing word or phrase, make sure to use '___________'
                - Do not repeat prompts
                Theme: ${theme ?? "funny"},
                Round: ${roundIndex ?? 0}`
            ],
        });
        const text = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
        return NextResponse.json({ prompt: text });
    } catch (err){
        console.error(err);
        return NextResponse.json({ error: "AI error" }, { status: 500 });
    }
    
}