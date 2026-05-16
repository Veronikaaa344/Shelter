import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		type: {
			type: String,
			required: true, // e.g., 'breathing', 'diagnostic', 'material_view', 'streak_bonus'
		},
		name: {
			type: String, // e.g., 'Дихання 4-4-4-4', 'Діагностика стану'
		},
		change: {
			type: Number,
			default: 0, // e.g., +5, -2
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed, // Для дополнительных данных (ID материала, результат теста и т.д.)
		},
	},
	{
		timestamps: { createdAt: true, updatedAt: false }, // Нам нужно только время создания
	}
);

// Создаем составной индекс для быстрой выборки истории по времени
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("ActivityLog", ActivityLogSchema);
