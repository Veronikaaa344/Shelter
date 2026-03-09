import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

router.post("/update-resilience", async (req, res) => {
	try {
		const { userId, amount, type, name } = req.body;

		if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ message: "Invalid ID" });
		}

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		let currentRes = (user.stats.resilience || 50) + amount;
		if (currentRes > 100) currentRes = 100;
		if (currentRes < 0) currentRes = 0;

		user.stats.resilience = currentRes;
		user.history.unshift({
			activityType: type,
			activityName: name,
			change: amount,
			newScore: currentRes,
			date: new Date(),
		});

		await user.save();
		res.json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/:id/stats-volume", async (req, res) => {
	try {
		if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({ message: "Invalid ID" });
		}
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });
		const now = new Date();
		const getStats = (days) => {
			const cutoff = new Date();
			cutoff.setDate(now.getDate() - days);
			const filtered = (user.history || []).filter(
				(h) => new Date(h.date) >= cutoff,
			);
			const plus = filtered
				.filter((h) => h.change > 0)
				.reduce((acc, curr) => acc + curr.change, 0);
			const minus = filtered
				.filter((h) => h.change < 0)
				.reduce((acc, curr) => acc + curr.change, 0);
			return { plus, minus, total: plus + minus };
		};

		res.json({
			today: getStats(1),
			week: getStats(7),
			allTime: user.stats,
			history: user.history,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/:id/stats", async (req, res) => {
	try {
		if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({ message: "Invalid ID" });
		}

		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });
		res.json(user.stats);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;
