require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const authRouter = require("../routes/authRouter");
const orderRouter = require("../routes/orderRouter");
const poolRouter = require("../routes/poolRouter");
const poolProcessingRouter = require("../routes/poolProcessingRouter");
const poolResultsRouter = require("../routes/poolResultsRouter");
const tokenRouter = require("../routes/tokenRouter");
const connectToDatabase = require("../configs/db");

const { job } = require("../services/scheduleService");
const { logger } = require("../logger");

const app = express();

// CORS config
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Server is running...",
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api", orderRouter);
app.use("/api", poolRouter);
app.use("/api", poolProcessingRouter);
app.use("/api", poolResultsRouter);
app.use("/api", tokenRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// MongoDB connection (only once)
let isDbConnected = false;
const setup = async () => {
  if (!isDbConnected) {
    try {
      await connectToDatabase();
      console.log("Database connected successfully");
      logger.info("Database connected successfully");
      job();
      isDbConnected = true;
    } catch (error) {
      console.error("Database connection failed:", error);
      logger.error("Database connection failed:", error);
    }
  }
};

// Wrap Express app in handler for Vercel
module.exports = async (req, res) => {
  await setup();         // Make sure DB is connected before handling
  app(req, res);         // Pass request to Express
};

// Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, async () => {
//   await setup(); // Ensure DB is connected before starting the server
//   console.log(`Server is running on port ${PORT}`);
// });