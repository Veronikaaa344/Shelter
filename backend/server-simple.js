import express from "express";
import cors from "cors";

const app = express();

// CORS для всех доменов (для теста)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Простой health endpoint без MongoDB
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Simple server is running",
    timestamp: new Date().toISOString(),
    node_version: process.version
  });
});

// Простой guest endpoint без MongoDB
app.post("/api/auth/guest", (req, res) => {
  res.status(200).json({
    user: {
      id: "guest-test",
      email: "guest@test.com",
      role: "guest"
    },
    token: "guest-test-token"
  });
});

// Простой materials endpoint без MongoDB
app.get("/api/materials", (req, res) => {
  res.status(200).json([
    {
      _id: "test-1",
      title: "Test Material",
      content: "This is a test material",
      category: "test"
    }
  ]);
});

export default app;
