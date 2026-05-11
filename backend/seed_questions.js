import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "./models/Question.js";

dotenv.config();

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shelter_db";

const defaultQuestions = [
    { 
        text: "Як часто за останній тиждень ви відчували напруження?", 
        options: ["Ніколи", "Рідко", "Часто", "Постійно"], 
        points: [100, 70, 40, 10],
        order: 1
    },
    { 
        text: "Наскільки легко вам вдається зосередитися?", 
        options: ["Дуже легко", "Важко", "Майже неможливо", "Легко"], 
        points: [100, 40, 15, 80],
        order: 2
    },
    { 
        text: "Чи відчуваєте ви підтримку від близьких людей?", 
        options: ["Повну", "Часткову", "Мінімальну", "Зовсім ні"], 
        points: [100, 70, 40, 10],
        order: 3
    },
    { 
        text: "Як оціните якість свого сну?", 
        options: ["Відмінна", "Задовільна", "Погана", "Жахлива"], 
        points: [100, 70, 30, 0],
        order: 4,
        category: "general"
    },
    // Anxiety Category
    { 
        text: "Як часто ви відчуваєте безпричинний страх?", 
        options: ["Ніколи", "Рідко", "Часто", "Постійно"], 
        points: [100, 70, 30, 0],
        order: 5,
        category: "anxiety"
    },
    { 
        text: "Чи турбують вас нав'язливі думки?", 
        options: ["Зовсім ні", "Іноді", "Досить часто", "Майже завжди"], 
        points: [100, 60, 30, 0],
        order: 6,
        category: "anxiety"
    },
    // Stress Category
    { 
        text: "Наскільки ви відчуваєте виснаження в кінці дня?", 
        options: ["Зовсім ні", "Трохи", "Сильно", "Екстремально"], 
        points: [100, 80, 40, 0],
        order: 7,
        category: "stress"
    }
];

async function seed() {
    try {
        await mongoose.connect(dbURI);
        console.log("✅ Connected to MongoDB");
        
        await Question.deleteMany({});
        console.log("🗑️ Cleared existing questions");
        
        await Question.insertMany(defaultQuestions);
        console.log("✅ Seeded questions successfully");
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding:", err);
        process.exit(1);
    }
}

seed();
