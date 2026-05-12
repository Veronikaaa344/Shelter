import { Router } from "express";
import mongoose from "mongoose";
import Material from "../models/Material.js";
const router = Router();

router.get("/", async (req, res) => {
	try {
		const startTime = Date.now();
		const materials = await Material.find()
			.maxTimeMS(30000) 
			.lean() 
			.exec();

		const duration = Date.now() - startTime;
		console.log(`[${new Date().toISOString()}] ✅ Materials fetched: ${materials.length} (${duration}ms)`);

		res.json(materials);
	} catch (err) {
		console.error(`[${new Date().toISOString()}] ❌ Error fetching materials:`, err.message);
		console.error(`[${new Date().toISOString()}] Full error:`, err);
		console.error(`[${new Date().toISOString()}] Error name:`, err.name);
		console.error(`[${new Date().toISOString()}] Error code:`, err.code);
		res.status(500).json({ message: err.message, error: err.name });
	}
});

router.get("/:id", async (req, res) => {
	try {
		console.log(`[${new Date().toISOString()}] Fetching material by ID: ${req.params.id}`);
		let material;
		if (mongoose.Types.ObjectId.isValid(req.params.id)) {
			material = await Material.findById(req.params.id);
		}
		if (!material) {
			material = await Material.findOne({ materialId: req.params.id });
		}

		if (!material) {
			console.log(`[${new Date().toISOString()}] ❌ Material not found: ${req.params.id}`);
			return res.status(404).json({ message: "Матеріал не знайдено" });
		}
		console.log(`[${new Date().toISOString()}] ✅ Material found: ${material.title}`);
		res.json(material);
	} catch (err) {
		console.error(`[${new Date().toISOString()}] ❌ Error fetching material:`, err.message);
		res.status(500).json({ message: err.message });
	}
});

router.post("/", async (req, res) => {
	try {
		console.log(`[${new Date().toISOString()}] 🟢 POST /api/materials - Creating new material`);
		console.log(`[${new Date().toISOString()}] 📋 Request body:`, JSON.stringify(req.body, null, 2));
		console.log(`[${new Date().toISOString()}] 🔗 MongoDB connection state:`, mongoose.connection.readyState);
		console.log(`[${new Date().toISOString()}] 📦 Database name:`, mongoose.connection.name);
		
		const newMaterial = new Material(req.body);
		console.log(`[${new Date().toISOString()}] 🆕 New material object created:`, JSON.stringify(newMaterial, null, 2));
		
		const saved = await newMaterial.save();
		console.log(`[${new Date().toISOString()}] ✅ Material successfully saved to MongoDB:`, JSON.stringify(saved, null, 2));
		console.log(`[${new Date().toISOString()}] 📊 Material _id:`, saved._id);
		console.log(`[${new Date().toISOString()}] 📊 Material title:`, saved.title);
		
		res.status(201).json(saved);
	} catch (err) {
		console.error(`[${new Date().toISOString()}] ❌ ERROR creating material:`, err.message);
		console.error(`[${new Date().toISOString()}] ❌ Full error:`, err);
		console.error(`[${new Date().toISOString()}] ❌ Error name:`, err.name);
		console.error(`[${new Date().toISOString()}] ❌ Error code:`, err.code);
		res.status(400).json({ message: err.message, error: err.name });
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
