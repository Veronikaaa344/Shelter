import cookieParser from "cookie-parser";
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
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
	const start = Date.now();
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
	console.log(`Headers:`, JSON.stringify(req.headers, null, 2));
	console.log(`Query:`, JSON.stringify(req.query, null, 2));
	console.log(`Body:`, JSON.stringify(req.body, null, 2));

	// Log response
	res.on('finish', () => {
		const duration = Date.now() - start;
		console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
	});

	next();
});

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shelter_db";

console.log(`[${new Date().toISOString()}] Connecting to MongoDB...`);
console.log(`[${new Date().toISOString()}] MongoDB URI:`, dbURI.replace(/:[^:]+@/, ":****@"));

mongoose
	.connect(dbURI, {
		serverSelectionTimeoutMS: 30000,
		socketTimeoutMS: 45000,
		connectTimeoutMS: 30000,
		bufferMaxEntries: 0,
		bufferCommands: false,
	})
	.then(() => {
		console.log(`[${new Date().toISOString()}] MongoDB Connected successfully!`);
		console.log(`[${new Date().toISOString()}] Connection state:`, mongoose.connection.readyState);
	})
	.catch((err) => {
		console.error(`[${new Date().toISOString()}] MongoDB Connection Error:`, err.message);
		console.error(`[${new Date().toISOString()}] Full error:`, err);
		console.error(`[${new Date().toISOString()}] MongoDB URI used:`, dbURI.replace(/:[^:]+@/, ":****@"));
	});

app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint for Render
app.get("/api/health", (req, res) => {
	res.status(200).json({ status: "OK", message: "Server is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
