import { Router } from "express";
import mongoose from "mongoose";
import Material from "../models/Material.js";
const router = Router();

router.get("/", async (req, res) => {
	try {
		console.log(`[${new Date().toISOString()}] Fetching materials...`);
		console.log(`[${new Date().toISOString()}] MongoDB connection state:`, mongoose.connection.readyState);
		console.log(`[${new Date().toISOString()}] MongoDB connected:`, mongoose.connection.readyState === 1);

		const startTime = Date.now();
		const materials = await Material.find();
		const duration = Date.now() - startTime;

		console.log(`[${new Date().toISOString()}] ✅ Materials found:`, materials.length, `(${duration}ms)`);
		console.log(`[${new Date().toISOString()}] Materials data:`, JSON.stringify(materials.map(m => ({
			_id: m._id,
			title: m.title,
			type: m.type,
			content_length: m.content?.length || 0
		})), null, 2));

		res.json(materials);
	} catch (err) {
		console.error(`[${new Date().toISOString()}] ❌ Error fetching materials:`, err.message);
		console.error(`[${new Date().toISOString()}] Full error:`, err);
		console.error(`[${new Date().toISOString()}] Error name:`, err.name);
		console.error(`[${new Date().toISOString()}] Error code:`, err.code);
		res.status(500).json({ message: err.message, error: err.name });
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
