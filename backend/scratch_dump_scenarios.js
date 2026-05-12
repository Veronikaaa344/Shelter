import mongoose from "mongoose";
import dotenv from "dotenv";
import Scenario from "./models/Scenario.js";

dotenv.config();

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shelter_db";

async function dumpScenarios() {
    try {
        await mongoose.connect(dbURI);
        console.log("--- START SCENARIOS DUMP ---");
        
        const scenarios = await Scenario.find({});
        console.log(JSON.stringify(scenarios, null, 2));
        
        console.log("--- END SCENARIOS DUMP ---");
        process.exit(0);
    } catch (err) {
        console.error("Error dumping scenarios:", err);
        process.exit(1);
    }
}

dumpScenarios();
