import { Schema, model } from "mongoose";

const ScenarioSchema = new Schema({
	scenarioId: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	type: {
		type: String,
		enum: ["dialogue", "find-differences"],
		default: "dialogue",
	},
	category: {
		type: String,
		enum: ["general", "anxiety", "stress", "apathy"],
		default: "general",
	},
	duration: { type: String, default: "5 хв" },
	difficulty: { type: Number, default: 50, min: 0, max: 100 },
	nodes: { type: Schema.Types.Mixed },
	levels: [{
		image: { type: String },
		differences: [{
			x: { type: Number },
			y: { type: Number },
			radius: { type: Number },
		}],
	}],
});

export default model("Scenario", ScenarioSchema);
