import express from "express";
import mongoose from "mongoose";
import Scenario from "../models/Scenario.js";

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		console.log(`[${new Date().toISOString()}] Fetching scenarios...`);
		console.log(`[${new Date().toISOString()}] MongoDB connection state:`, mongoose.connection.readyState);
		console.log(`[${new Date().toISOString()}] MongoDB connected:`, mongoose.connection.readyState === 1);

		const startTime = Date.now();

		// Додаємо тайм-аут для запиту
		const scenarios = await Scenario.find()
			.maxTimeMS(30000) // 30 секунд тайм-аут
			.lean() // швидший запит без Mongoose документів
			.exec();

		const duration = Date.now() - startTime;

		console.log(`[${new Date().toISOString()}] ✅ Scenarios found:`, scenarios.length, `(${duration}ms)`);
		console.log(`[${new Date().toISOString()}] Scenarios data:`, JSON.stringify(scenarios.map(s => ({
			_id: s._id,
			scenarioId: s.scenarioId,
			name: s.name,
			type: s.type
		})), null, 2));

		res.json(scenarios);
	} catch (err) {
		console.error(`[${new Date().toISOString()}] ❌ Error fetching scenarios:`, err.message);
		console.error(`[${new Date().toISOString()}] Full error:`, err);
		console.error(`[${new Date().toISOString()}] Error name:`, err.name);
		console.error(`[${new Date().toISOString()}] Error code:`, err.code);
		res.status(500).json({ message: err.message, error: err.name });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const scenario = await Scenario.findOne({ scenarioId: req.params.id });
		if (!scenario)
			return res.status(404).json({ message: "Сценарій не знайдено" });
		res.json(scenario);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post("/", async (req, res) => {
	try {
		const newScenario = new Scenario(req.body);
		const saved = await newScenario.save();
		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		await Scenario.findByIdAndDelete(req.params.id);
		res.json({ message: "Сценарій видалено" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.put("/:id", async (req, res) => {
	try {
		const updated = await Scenario.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		res.json(updated);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

export default router;
