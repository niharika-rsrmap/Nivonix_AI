import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import uploadRoutes from "./routes/upload.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// =====================
// DATABASE CONNECTION
// =====================
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nivonix";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.warn("⚠️ MongoDB connection failed:", err.message);
    console.log("⚠️ App will run without database (auth will fail on DB operations)");
  });

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory");
}
console.log("📁 Uploads directory:", uploadsDir);

// =====================
// MIDDLEWARE
// =====================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080"
];

// Add frontend URL from environment if available
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// For production, allow all origins (Render deployment)
const corsOptions = process.env.NODE_ENV === "production" 
  ? { origin: "*", credentials: false }
  : { origin: allowedOrigins, credentials: true };

app.use(cors(corsOptions));

console.log("✅ CORS enabled for:", process.env.NODE_ENV === "production" ? "all origins" : allowedOrigins.join(", "));

app.use(express.json({ limit: '50mb' }));
console.log("✅ JSON parser enabled");

app.use(express.static("uploads"));
console.log("✅ Static file serving enabled");

// =====================
// ROUTES
// =====================
app.use("/api/auth", authRoutes);
console.log("✅ /api/auth routes loaded");

app.use("/api/chat", chatRoutes);
console.log("✅ /api/chat routes loaded");

app.use("/api/upload", uploadRoutes);
console.log("✅ /api/upload routes loaded");

// =====================
// HEALTH CHECK
// =====================
app.get("/", (req, res) => {
  res.json({ message: "✅ Backend server is running" });
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log("\n");
  console.log("╔════════════════════════════════════════╗");
  console.log("║   🎉 NIVONIX BACKEND READY 🎉         ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`\n📍 Server running on port: ${PORT}`);
  console.log(`🔐 Auth: /api/auth/google`);
  console.log(`💬 Chat: /api/chat`);
  console.log(`📤 Upload: /api/upload`);
  console.log(`\n🌐 Environment: ${process.env.NODE_ENV || "development"}\n`);
});
