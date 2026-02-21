import { NextRequest, NextResponse } from "next/server";
import axios from "axios";


const chatMemory: Record<string, string[]> = {};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, message } = body;

        if (!message || !sessionId) {
            return NextResponse.json(
                { message: "Message and sessionId are required" },
                { status: 400 }
            );
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) throw new Error("GEMINI_API_KEY belum diisi di .env.local");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;


        const previousMessages = chatMemory[sessionId] || [];


        let recommendation = "";
        if (message.toLowerCase().includes("react")) {
            recommendation = "Tips: Gunakan hooks useState dan useEffect untuk state management.";
        } else if (message.toLowerCase().includes("api")) {
            recommendation = "Rekomendasi: Selalu gunakan try/catch saat fetch API.";
        }


        const systemPrompt = `
Kamu adalah asisten pemrograman senior software engineer yang teliti.
Jawablah dengan gaya santai.
Jangan pernah memberikan nasihat isu politik.
Setiap perbandingan jawab dengan format tabel.
        `;


        const finalMessage = `
${systemPrompt}
Memory percakapan sebelumnya: ${previousMessages.join("\n")}
Rekomendasi tambahan: ${recommendation}
User: ${message}
        `;


        const response = await axios.post(
            url,
            {
                contents: [{ parts: [{ text: finalMessage }] }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 500,
                },
            },
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        const botReply =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
            "No reply from the API";


        if (!chatMemory[sessionId]) chatMemory[sessionId] = [];
        chatMemory[sessionId].push(`User: ${message}`);
        chatMemory[sessionId].push(`Bot: ${botReply}`);

        return NextResponse.json(
            { reply: botReply },
            {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            }
        );

    } catch (error: any) {
        console.error("API Gemini error:", error.response?.data || error.message);
        return NextResponse.json(
            { message: "Something went wrong", error: error.response?.data || error.message },
            { status: 500 }
        );
    }
}