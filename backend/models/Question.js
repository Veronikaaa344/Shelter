import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    points: [{ type: Number, required: true }],
    order: { type: Number, default: 0 },
    category: { type: String, default: "general" }
});

export default mongoose.model("Question", QuestionSchema);
