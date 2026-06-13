import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const filesToTranslate = [
    "../my-app/src/components/BreathingExercise/BreathingExercise.jsx",
    "../my-app/src/components/characterCompanion/CharacterCompanion.jsx",
    "../my-app/src/components/FlipSidebarItem/FlipSidebarItem.jsx",
    "../my-app/src/components/MainChat/MainChat.jsx",
    "../my-app/src/components/MainChat/MistakesAnalysis.jsx",
    "../my-app/src/components/MainHeader/MainHeader.jsx",
    "../my-app/src/components/MainSidebar/MainSidebar.jsx",
    "../my-app/src/components/SOSOverlay/SOSOverlay.jsx",
    "../my-app/src/components/views/DiaryView/DiaryView.jsx",
    "../my-app/src/components/views/HomeView/HomeView.jsx",
    "../my-app/src/components/views/LibraryView/LibraryView.jsx",
    "../my-app/src/components/views/PracticeView/PracticeView.jsx",
    "../my-app/src/components/views/QuestsView/QuestsView.jsx",
    "../my-app/src/infrastructure/api/api.js",
    "../my-app/src/main/ShelterAppComplete.jsx",
    "../my-app/src/pages/Admin/AdminMaterials.jsx",
    "../my-app/src/pages/Admin/AdminPage.jsx",
    "../my-app/src/pages/Admin/AdminScenarios.jsx",
    "../my-app/src/pages/Simulator/SortingPage.jsx",
    "../my-app/src/pages/Simulator/UpdatedFindDifferencesPage.jsx",
    "../my-app/src/pages/Simulator/UpdatedSortingPage.jsx",
    "../my-app/src/pages/Simulator/UpdatedVideoScenarioPage.jsx",
    "../my-app/src/pages/SOS/variants/BlueView.jsx",
    "../my-app/src/pages/SOS/variants/SosView.jsx",
    "../my-app/src/pages/SOS/sosPage.jsx",
    "../my-app/src/App.js",
    "./routes/auth.js",
    "./routes/chat.js",
    "./routes/diagnostic.js",
    "./routes/materials.js",
    "./routes/scenarios.js",
    "./routes/stats.js",
    "./middleware/auth.js",
    "./models/Material.js",
    "./models/Scenario.js",
    "./models/UserStats.js",
    "./data/adviceData.js",
    "./data/sortingScenarios.js"
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    for (let file of filesToTranslate) {
        const filePath = path.resolve(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
            console.log(`Skipping ${file}, not found.`);
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        
        // Skip if no cyrillic
        if (!/[А-Яа-яІіЇїЄєҐґ]/.test(content)) {
            console.log(`No Ukrainian text in ${file}, skipping.`);
            continue;
        }

        console.log(`Translating ${file}...`);
        
        const prompt = `
You are a code translator.
I will give you a source code file. Your task is to translate ALL Ukrainian text strings, comments, UI text, error messages, and console logs into English.
CRITICAL RULES:
1. Do NOT change ANY code logic, variable names, syntax, formatting, or English text.
2. Only translate the human-readable text strings that are currently in Ukrainian.
3. Return ONLY the translated source code file in your response. No markdown formatting blocks like \`\`\`javascript, no explanations, just the raw code.
If there are translation keys like \`t('key', 'укр')\`, change it to \`t('key', 'eng')\`.
Here is the code:

${content}
`;

        try {
            const result = await model.generateContent(prompt);
            let translatedCode = result.response.text();
            
            // clean up markdown blocks if model added them
            translatedCode = translatedCode.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');

            fs.writeFileSync(filePath, translatedCode, 'utf8');
            console.log(`✅ Translated ${file}`);
        } catch (e) {
            console.error(`❌ Failed to translate ${file}:`, e.message);
        }
        
        await delay(2000); // Rate limiting
    }
    console.log("Translation complete.");
    process.exit(0);
}

run().catch(console.error);
