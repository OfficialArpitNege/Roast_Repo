import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";

// ---------------------------------------------------------------------------
// Validate critical environment variables on startup
// ---------------------------------------------------------------------------
if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
  console.error("❌  GROQ_API_KEY is missing or still set to the placeholder value.");
  console.error("   Copy .env.example → .env and add your real Groq API key.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api", analyzeRouter);

// Health-check endpoints
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: {
      groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      groqKeySet: !!process.env.GROQ_API_KEY,
      port: PORT,
    },
  });
});

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Roast My GitHub API is running 🔥" });
});

// ---------------------------------------------------------------------------
// Global 404 handler
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});
