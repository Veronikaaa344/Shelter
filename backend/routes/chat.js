import express from "express";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const router = express.Router();

router.post("/", async (req, res) => {
	try {
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		const { scenarioName, scenarioDescription, userOption, history } = req.body;
		
		const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

		const systemInstruction = `You are a dynamic AI scenario simulator. You play the role of the other person in a psychological training scenario.
Scenario Name: "${scenarioName || 'Training Scenario'}"
Scenario Description: "${scenarioDescription || 'A conversation to test resilience.'}"

Rules:
1. All text must be generated in English ONLY. Do not use Ukrainian.
2. The user will talk to you. You must respond naturally as the character. Keep responses short and realistic (1-3 sentences).
3. Generate 4 possible options for the user to reply to your message. These 4 options must be distinctly different in meaning and emotion (e.g., one empathetic, one neutral, one confrontational, one avoidant/passive). 
4. Assign a weight to each option from -15 to +15 based on how psychologically resilient, constructive, or healthy the choice is (+15 is excellent, -15 is terrible).
5. Decide if the conversation has naturally reached an end. Do not end it too quickly; sustain the dialogue for at least 6-8 turns if possible, unless the user resolves the issue perfectly or completely destroys the relationship. If finished, set isFinish to true.
6. If the conversation is finished, provide a final overall score (0 to 100).
7. You must return the output EXACTLY in JSON format following the schema provided.`;

		const schema = {
			type: SchemaType.OBJECT,
			properties: {
				text: {
					type: SchemaType.STRING,
					description: "Your response to the user's action, speaking as the character in the scenario."
				},
				options: {
					type: SchemaType.ARRAY,
					items: {
						type: SchemaType.OBJECT,
						properties: {
							text: { type: SchemaType.STRING, description: "The text of the option the user can click." },
							weight: { type: SchemaType.INTEGER, description: "The psychological score of this option from -15 to 15." }
						},
						required: ["text", "weight"]
					},
					description: "Exactly 4 options with distinct emotions and meanings (e.g. empathetic, neutral, confrontational, avoidant)."
				},
				isFinish: {
					type: SchemaType.BOOLEAN,
					description: "True if the scenario should end naturally here (usually after 6-8 turns)."
				},
				score: {
					type: SchemaType.INTEGER,
					description: "Final score from 0 to 100. Provide this only if isFinish is true."
				}
			},
			required: ["text", "options", "isFinish"]
		};

		// Convert history from frontend into Gemini format
		let chatHistory = [];
		if (history && history.length > 0) {
			chatHistory = history.map(msg => ({
				role: msg.sender === 'user' ? 'user' : 'model',
				parts: [{ text: msg.text }]
			}));

			if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
				chatHistory.unshift({ role: 'user', parts: [{ text: 'Start the scenario.' }] });
			}
		}

		const chat = model.startChat({
			systemInstruction: { parts: [{ text: systemInstruction }] },
			history: chatHistory,
			generationConfig: {
				responseMimeType: "application/json",
				responseSchema: schema,
			}
		});

		const prompt = userOption ? `User said: "${userOption}"` : "Start the conversation.";
		const result = await chat.sendMessage(prompt);
		const responseText = result.response.text();
		
		const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
		const parsedResponse = JSON.parse(cleanJson);

		return res.status(200).json({
			text: parsedResponse.text,
			options: parsedResponse.options,
			isFinish: parsedResponse.isFinish,
			score: parsedResponse.score || 0,
			role: "model"
		});

	} catch (error) {
		console.error("Chat API Error:", error);
		res.status(500).json({ error: "Failed to process chat message." });
	}
});

export default router;
