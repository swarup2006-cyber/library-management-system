const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const userRoutes = require("./routes/userRoutes");
const { errorMiddleware } = require("./middlewares/errorMiddleware");

const app = express();
const explicitlyAllowedOrigins = Array.from(
  new Set(
    [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
      ...(process.env.FRONTEND_URLS || "").split(","),
      process.env.FRONTEND_URL || "",
    ]
      .map((origin) => origin.trim())
      .filter(Boolean)
  )
);

const isPrivateDevOrigin = (origin) => {
  try {
    const { protocol, hostname } = new URL(origin);

    if (!["http:", "https:"].includes(protocol)) {
      return false;
    }

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
    );
  } catch {
    return false;
  }
};

// Connect DB
connectDB();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || explicitlyAllowedOrigins.includes(origin) || isPrivateDevOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api", borrowRoutes);
app.use("/api/users", userRoutes);
app.use(errorMiddleware);

module.exports = app;
