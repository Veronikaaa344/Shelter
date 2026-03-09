import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true },
	diagnostic: {
		answers: [String],
		completedAt: { type: Date },
	},
	stats: {
		resilience: { type: Number, default: 50 },
		stabilityDays: { type: Number, default: 0 },
	},
	history: [
		{
			date: { type: Date, default: Date.now },
			activityType: { type: String },
			activityName: { type: String },
			change: { type: Number },
			newScore: { type: Number },
		},
	],
});

export default mongoose.model("User", UserSchema);
