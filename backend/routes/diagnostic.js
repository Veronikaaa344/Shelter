import express from "express";
import Question from "../models/Question.js";

const router = express.Router();

// Get diagnostic questions (optional filtering by category)
router.get("/questions", async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const questions = await Question.find(filter).sort({ order: 1 });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Seed questions (internal/admin use)
router.post("/seed", async (req, res) => {
    try {
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
                order: 4
            }
        ];

        await Question.deleteMany({}); // Clear existing
        const saved = await Question.insertMany(defaultQuestions);
        res.json({ message: "Diagnostic questions seeded successfully", count: saved.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
