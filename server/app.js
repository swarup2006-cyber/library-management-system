const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Simple route (for testing)
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);