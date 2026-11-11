
const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://uni-serve-xi.vercel.app",
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options(/.*/, cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
let databaseConnection;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!databaseConnection) {
    databaseConnection = mongoose.connect(process.env.MONGO_URI);
  }

  try {
    await databaseConnection;
    console.log("MongoDB connected successfully.");
  } catch (error) {
    databaseConnection = null;
    throw error;
  }
};

// Ensure database connection before API requests
app.use(async (req, res, next) => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing.");
    }

    await connectDB();
    next();
  } catch (error) {
    console.error("Database/API initialization error:", error);

    res.status(500).json({
      success: false,
      message: "Server initialization failed.",
    });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "University Maintenance API is running.",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

module.exports = app;
