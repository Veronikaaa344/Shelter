import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

dotenv.config();

import authRoutes from "./routes/auth.js";
import materialRoutes from "./routes/materials.js";
import scenarioRoutes from "./routes/scenarios.js";
import userRoutes from "./routes/user.js";

const app = express();

const allowedOrigins = [
	"http://localhost:3000",
	"https://shelter-jsv0.onrender.com"
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
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
	})
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

console.log(`[${new Date().toISOString()}] 🚀 Server starting...`);
console.log(`[${new Date().toISOString()}] 🌍 Environment:`, process.env.NODE_ENV);
console.log(`[${new Date().toISOString()}] 📡 Port:`, process.env.PORT || 5000);
console.log(`[${new Date().toISOString()}] 🔗 MongoDB URI:`, dbURI.replace(/:[^:]+@/, ":****@"));
console.log(`[${new Date().toISOString()}] 📦 MONGO_URI exists:`, !!process.env.MONGO_URI);

mongoose
	.connect(dbURI, {
		serverSelectionTimeoutMS: 30000,
		socketTimeoutMS: 45000,
		connectTimeoutMS: 30000,
		maxPoolSize: 10,
		minPoolSize: 2,
	})
	.then(() => {
		console.log(`[${new Date().toISOString()}] ✅ MongoDB Connected successfully!`);
		console.log(`[${new Date().toISOString()}] 🔗 Connection state:`, mongoose.connection.readyState);
		console.log(`[${new Date().toISOString()}] 📦 Database name:`, mongoose.connection.name);
	})
	.catch((err) => {
		console.error(`[${new Date().toISOString()}] ❌ MongoDB Connection Error:`, err.message);
		console.error(`[${new Date().toISOString()}] ❌ Full error:`, err);
		console.error(`[${new Date().toISOString()}] ❌ MongoDB URI used:`, dbURI.replace(/:[^:]+@/, ":****@"));
		console.error(`[${new Date().toISOString()}] ❌ Process will exit now...`);
		process.exit(1);
	});

app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint for Vercel
app.get("/api/health", async (req, res) => {
	try {
		const mongoStatus = mongoose.connection.readyState;
		const mongoStatusText = mongoStatus === 1 ? "connected" : mongoStatus === 2 ? "connecting" : "disconnected";
		
		res.status(200).json({ 
			status: "OK", 
			message: "Server is running",
			mongodb: {
				status: mongoStatusText,
				readyState: mongoStatus,
				dbName: mongoose.connection.name || "not connected"
			},
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		res.status(500).json({ 
			status: "ERROR", 
			message: "Server error",
			error: error.message 
		});
	}
});

// Full database dump endpoint
app.get("/api/db-dump", async (req, res) => {
	try {
		console.log(`[${new Date().toISOString()}] 🗄️ Full database dump requested`);
		
		const db = mongoose.connection.db;
		const collections = await db.listCollections().toArray();
		
		console.log(`[${new Date().toISOString()}] 📋 Found collections:`, collections.map(c => c.name));
		
		const fullDump = {
			database: db.databaseName,
			collections: [],
			totalDocuments: 0
		};
		
		for (const collection of collections) {
			const collData = {
				name: collection.name,
				count: 0,
				documents: []
			};
			
			try {
				const docs = await db.collection(collection.name).find({}).toArray();
				collData.count = docs.length;
				collData.documents = docs;
				fullDump.totalDocuments += docs.length;
				
				console.log(`[${new Date().toISOString()}] 📄 Collection ${collection.name}: ${docs.length} documents`);
			} catch (err) {
				console.error(`[${new Date().toISOString()}] ❌ Error reading collection ${collection.name}:`, err.message);
				collData.error = err.message;
			}
			
			fullDump.collections.push(collData);
		}
		
		console.log(`[${new Date().toISOString()}] ✅ Total documents in database: ${fullDump.totalDocuments}`);
		
		res.status(200).json(fullDump);
	} catch (err) {
		console.error(`[${new Date().toISOString()}] ❌ Database dump error:`, err.message);
		res.status(500).json({ error: err.message });
	}
});

// MongoDB connection test endpoint
app.get("/api/mongodb-test", async (req, res) => {
	try {
		console.log(`[${new Date().toISOString()}] Testing MongoDB connection...`);
		console.log(`[${new Date().toISOString()}] Connection state:`, mongoose.connection.readyState);
		console.log(`[${new Date().toISOString()}] Connected:`, mongoose.connection.readyState === 1);
		console.log(`[${new Date().toISOString()}] Database name:`, mongoose.connection.name);

		// Тестуємо простий запит
		const startTime = Date.now();
		const collections = await mongoose.connection.db.listCollections().toArray();
		const duration = Date.now() - startTime;

		console.log(`[${new Date().toISOString()}] ✅ Collections found:`, collections.length, `(${duration}ms)`);

		// Перевіряємо дані в кожній колекції
		const collectionDetails = {};
		for (const collection of collections) {
			const collStartTime = Date.now();
			const count = await mongoose.connection.db.collection(collection.name).countDocuments();
			const collDuration = Date.now() - collStartTime;
			
			collectionDetails[collection.name] = {
				count: count,
				duration: `${collDuration}ms`
			};
			
			// Якщо є документи, показуємо перший
			if (count > 0) {
				const firstDoc = await mongoose.connection.db.collection(collection.name).findOne();
				collectionDetails[collection.name].firstDocument = {
					_id: firstDoc._id,
					title: firstDoc.title || firstDoc.name || 'N/A',
					keys: Object.keys(firstDoc).slice(0, 5)
				};
			}
		}

		console.log(`[${new Date().toISOString()}] ✅ Collection details:`, collectionDetails);

		res.status(200).json({
			status: "OK",
			connected: mongoose.connection.readyState === 1,
			database: mongoose.connection.name,
			collections: collections.length,
			collectionNames: collections.map(c => c.name),
			details: collectionDetails,
			duration: `${duration}ms`
		});
	} catch (err) {
		console.error(`[${new Date().toISOString()}] ❌ MongoDB test error:`, err.message);
		console.error(`[${new Date().toISOString()}] Full error:`, err);
		res.status(500).json({
			error: err.message,
			connected: mongoose.connection.readyState === 1,
			state: mongoose.connection.readyState,
			database: mongoose.connection.name
		});
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`[${new Date().toISOString()}] 🎉 Server successfully started on port ${PORT}`);
	console.log(`[${new Date().toISOString()}] 🌐 Server URL: http://localhost:${PORT}`);
	console.log(`[${new Date().toISOString()}] 📊 Health check: http://localhost:${PORT}/api/health`);
	console.log(`[${new Date().toISOString()}] 🗄️ DB dump: http://localhost:${PORT}/api/db-dump`);
});
