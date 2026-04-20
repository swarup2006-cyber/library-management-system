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

// Connect DB
connectDB();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
