import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shelter_db";

async function checkCollections() {
    try {
        await mongoose.connect(dbURI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log("--- COLLECTIONS ---");
        for (let coll of collections) {
            const count = await db.collection(coll.name).countDocuments();
            console.log(`${coll.name}: ${count} docs`);
        }
        
        // Also dump first 2 docs of each to see content
        for (let coll of collections) {
            console.log(`\n--- Sample from ${coll.name} ---`);
            const docs = await db.collection(coll.name).find().limit(2).toArray();
            console.log(JSON.stringify(docs, null, 2));
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCollections();
