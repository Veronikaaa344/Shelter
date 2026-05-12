import mongoose from "mongoose";
import dotenv from "dotenv";
import Material from "./models/Material.js";
import Question from "./models/Question.js";

dotenv.config();

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shelter_db";

async function dumpAllData() {
    try {
        await mongoose.connect(dbURI);
        
        console.log("--- MATERIALS DUMP ---");
        const materials = await Material.find({});
        console.log(JSON.stringify(materials, null, 2));
        
        console.log("\n--- QUESTIONS DUMP ---");
        const questions = await Question.find({});
        console.log(JSON.stringify(questions, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

dumpAllData();
