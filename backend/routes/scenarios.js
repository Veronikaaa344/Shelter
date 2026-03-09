import express from "express";
import Scenario from "../models/Scenario.js";

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const scenarios = await Scenario.find();
		res.json(scenarios);
	} catch (err) {
		res.status(500).json({ message: err.message });
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
