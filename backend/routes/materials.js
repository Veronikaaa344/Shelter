import { Router } from "express";
import Material from "../models/Material.js";
const router = Router();

router.get("/", async (req, res) => {
	try {
		console.log("Fetching materials...");
		const materials = await Material.find();
		console.log("Materials found:", materials.length);
		res.json(materials);
	} catch (err) {
		console.error("Error fetching materials:", err);
		res.status(500).json({ message: err.message });
	}
});

router.post("/", async (req, res) => {
	try {
		console.log("Creating material:", req.body);
		const newMaterial = new Material(req.body);
		const saved = await newMaterial.save();
		console.log("Material created:", saved);
		res.status(201).json(saved);
	} catch (err) {
		console.error("Error creating material:", err);
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
		console.log("Updating material:", req.params.id, req.body);
		const updated = await Material.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		console.log("Material updated:", updated);
		res.json(updated);
	} catch (err) {
		console.error("Error updating material:", err);
		res.status(400).json({ message: err.message });
	}
});

export default router;
