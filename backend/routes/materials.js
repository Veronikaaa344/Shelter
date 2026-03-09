import { Router } from "express";
import Material from "../models/Material.js";
const router = Router();

router.get("/", async (req, res) => {
	try {
		const materials = await Material.find();
		res.json(materials);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post("/", async (req, res) => {
	try {
		const newMaterial = new Material(req.body);
		const saved = await newMaterial.save();
		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		await Material.findByIdAndDelete(req.params.id);
		res.json({ message: "Матеріал видалено" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.put("/:id", async (req, res) => {
	try {
		const updated = await Material.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		res.json(updated);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

export default router;
