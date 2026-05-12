import mongoose from "mongoose";
import dotenv from "dotenv";
import Scenario from "./models/Scenario.js";

dotenv.config();

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shelter_db";

const scenarios = [
  {
    scenarioId: "chaos-unloading",
    name: "Сортування хаосу",
    type: "sorting",
    category: "general",
    duration: "5 хв",
    difficulty: 50,
    description: "Тренажер для розвантаження думок та емоцій",
    content: {
        categories: [
            { id: 'constructive', name: 'Конструктивні думки', color: '#10b981' },
            { id: 'destructive', name: 'Руйнівні думки', color: '#ef4444' }
        ],
        items: [
            { text: "Я можу з цим впоратися поступово", categoryId: 'constructive' },
            { text: "Це ніколи не закінчиться", categoryId: 'destructive' },
            { text: "Мій стан — це нормальна реакція на ненормальні події", categoryId: 'constructive' },
            { text: "Я повинен бути ідеальним у всьому", categoryId: 'destructive' },
            { text: "Сьогодні я зроблю те, що в моїх силах", categoryId: 'constructive' },
            { text: "Все пропало, немає сенсу старатися", categoryId: 'destructive' },
            { text: "Я маю право на відпочинок та відновлення", categoryId: 'constructive' },
            { text: "Ніхто не розуміє мого болю", categoryId: 'destructive' },
            { text: "Я в безпеці тут і зараз", categoryId: 'constructive' },
            { text: "Завтра буде ще гірше ніж сьогодні", categoryId: 'destructive' },
            { text: "Маленькі кроки ведуть до великих змін", categoryId: 'constructive' },
            { text: "Я — невдаха, бо відчуваю страх", categoryId: 'destructive' }
        ]
    }
  },
  {
    scenarioId: "anxiety-dialogue-1",
    name: "Діалог з тривогою",
    type: "dialogue",
    category: "general",
    duration: "5 хв",
    difficulty: 50,
    description: "Інтерактивний тренажер для розпізнавання тривожних думок"
  }
];

async function seed() {
    try {
        await mongoose.connect(dbURI);
        console.log("✅ Connected to MongoDB");
        
        for (const sc of scenarios) {
            await Scenario.findOneAndUpdate(
                { scenarioId: sc.scenarioId },
                sc,
                { upsert: true, new: true }
            );
        }
        
        console.log("✅ Scenarios seeded successfully");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding scenarios:", err);
        process.exit(1);
    }
}

seed();
