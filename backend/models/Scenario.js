import { Schema, model } from "mongoose";

const ScenarioSchema = new Schema({
	scenarioId: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	category: {
		type: String,
		enum: ["general", "anxiety", "stress", "apathy"],
		default: "general",
	},
	nodes: { type: Schema.Types.Mixed, required: true },
});

export default model("Scenario", ScenarioSchema);
