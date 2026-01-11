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
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
  credentials: true
}));

console.log("✅ CORS enabled for localhost:5173, 3000, 8080");

app.use(express.json());
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
  console.log(`\n📍 Server: http://localhost:${PORT}`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/google`);
  console.log(`💬 Chat: http://localhost:${PORT}/api/chat`);
  console.log(`📤 Upload: http://localhost:${PORT}/api/upload`);
  console.log(`\n🌐 CORS Enabled: localhost:5173, 3000, 8080\n`);
});
