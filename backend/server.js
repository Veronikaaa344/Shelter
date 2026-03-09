import cors from "cors";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import materialRoutes from "./routes/materials.js";
import scenarioRoutes from "./routes/scenarios.js";
import userRoutes from "./routes/user.js";

const app = express();

const allowedOrigins = [
	"http://localhost:3000",
	"https://shelter-frontend.onrender.com",
];

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	}),
);

app.use(express.json());

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shelter_db";

mongoose
	.connect(dbURI)
	.then(() => console.log("MongoDB Connected"))
	.catch((err) => console.log("MongoDB Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
