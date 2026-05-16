import mongoose from "mongoose";

const DiaryEntrySchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		mood: {
			type: Number,
			required: true, // 0 - позитивний, 1 - нейтральний, 2 - негативний
		},
		content: {
			type: String,
			required: true,
		},
		tags: [String],
		wordCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: { createdAt: true, updatedAt: true },
	}
);

// Индекс для быстрой фильтрации по времени и пользователю
DiaryEntrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("DiaryEntry", DiaryEntrySchema);
