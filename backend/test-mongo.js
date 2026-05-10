import mongoose from "mongoose";
import "dotenv/config";

const dbURI = process.env.MONGO_URI || "mongodb+srv://veronikakhmelik:9xJbRug5yiaRPfCi@cluster0.9ux4v.mongodb.net/shelter_db?retryWrites=true&w=majority";

console.log("Testing MongoDB connection...");
console.log("URI:", dbURI.replace(/:[^:]+@/, ":****@"));

mongoose.connect(dbURI)
  .then(() => {
    console.log("✅ MongoDB Connected successfully!");
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log("✅ Collections found:", collections.map(c => c.name));
    return mongoose.connection.db.collection('materials').find().toArray();
  })
  .then(materials => {
    console.log("✅ Materials count:", materials.length);
    return mongoose.connection.db.collection('scenarios').find().toArray();
  })
  .then(scenarios => {
    console.log("✅ Scenarios count:", scenarios.length);
    console.log("✅ All tests passed!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ MongoDB Error:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  });
