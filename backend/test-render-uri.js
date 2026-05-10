import mongoose from "mongoose";

const renderURI = "mongodb+srv://shelter_render_user:k9qfYzshH71vmrXR@clustern.reruo2j.mongodb.net/shelter_db?retryWrites=true&w=majority";

console.log("Testing Render MONGO_URI...");
console.log("URI:", renderURI.replace(/:[^:]+@/, ":****@"));

mongoose.connect(renderURI)
  .then(() => {
    console.log("✅ Connected successfully!");
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log("✅ Collections found:", collections.length);
    console.log("✅ Collection names:", collections.map(c => c.name));
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Connection error:", err.message);
    console.error("❌ Full error:", err);
    process.exit(1);
  });
