import { Schema, model } from "mongoose";

const ScenarioSchema = new Schema({
	scenarioId: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	type: {
		type: String,
		enum: ["dialogue", "find-differences", "video", "audio", "sorting"],
		default: "dialogue",
	},
	category: {
		type: String,
		enum: ["general", "anxiety", "stress", "apathy"],
		default: "general",
	},
	duration: { type: String, default: "5 хв" },
	difficulty: { type: Number, default: 50, min: 0, max: 100 },
	image: { type: String }, // URL зображення для карточки
	description: { type: String }, // Опис сценарію
	nodes: { type: Schema.Types.Mixed },
	levels: [{
		image: { type: String },
		videoUrl: { type: String },
		videoTranscript: { type: String },
		audioUrl: { type: String },
		audioTranscript: { type: String },
		differences: [{
			x: { type: Number },
			y: { type: Number },
			radius: { type: Number },
		}],
	}],
	content: { type: Schema.Types.Mixed },
});

export default model("Scenario", ScenarioSchema);
