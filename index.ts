import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import authRoutes from "./routes/auth";
import diamondRoutes from "./routes/diamonds";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Adjust as needed for your frontend
}));
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/diamonds", diamondRoutes);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
