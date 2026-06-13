import fs from 'fs';
import path from 'path';

async function translateText(text) {
    if (!text || text.trim() === '') return text;
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=uk&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data[0].map(item => item[0]).join('');
    } catch (err) {
        console.error("Translation error:", err);
        return text; 
    }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    const files = [
        'burnout_dialogue_scenario.json',
        'burnout_overtime_scenario.json',
        'conflict_scenario.json',
        'impostor_dialogue_scenario.json',
        'relationship_crisis_scenario.json'
    ];

    for (let file of files) {
        console.log(`Processing ${file}...`);
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) continue;

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (data.name) data.name = await translateText(data.name);
        if (data.description) data.description = await translateText(data.description);
        if (data.duration) data.duration = data.duration.replace('хв', 'min');

        if (data.nodes) {
            for (let nodeId in data.nodes) {
                const node = data.nodes[nodeId];
                if (node.text) {
                    node.text = await translateText(node.text);
                    await delay(100);
                }
                if (node.options) {
                    for (let opt of node.options) {
                        if (opt.text) {
                            opt.text = await translateText(opt.text);
                            await delay(100);
                        }
                    }
                }
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Updated ${file} successfully!`);
    }

    process.exit(0);
}

run().catch(console.error);
