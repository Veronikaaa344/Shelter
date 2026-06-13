import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const schema = {
    type: SchemaType.OBJECT,
    properties: {
        text: { type: SchemaType.STRING },
        options: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    text: { type: SchemaType.STRING },
                    weight: { type: SchemaType.INTEGER }
                },
                required: ["text", "weight"]
            }
        },
        isFinish: { type: SchemaType.BOOLEAN },
        score: { type: SchemaType.INTEGER }
    },
    required: ["text", "options", "isFinish"]
};

async function test() {
    try {
        const chat = model.startChat({
            systemInstruction: { parts: [{ text: "You are a test. Reply with JSON." }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const result = await chat.sendMessage("Start");
        console.log(result.response.text());
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
