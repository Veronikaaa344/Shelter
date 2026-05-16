import mongoose from "mongoose";

const DiagnosticResultSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		score: {
			type: Number,
			required: true,
		},
		answers: [
			{
				questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
				value: Number,
				text: String, // Сохраняем текст ответа на случай изменения базы вопросов
			},
		],
		category: {
			type: String,
			default: "general",
		},
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	}
);

// Индекс для графиков прогресса
DiagnosticResultSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("DiagnosticResult", DiagnosticResultSchema);
