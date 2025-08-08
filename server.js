// import express from "express";
// import dotenv from "dotenv";
// import morgan from "morgan";
// import authRouter from "./routes/auth.route.js";
// import connectDB from "./config/db.js";

// dotenv.config();
// const app = express();


// app.use(express.json());
// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Welcome to the LMS Backend API" });
// });
// app.use('/api/auth', authRouter);

// const PORT = process.env.PORT || 3000;

// connectDB();
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import courseRoutes from "./routes/courseRoutes.js";

// Load environment variables
dotenv.config();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Static folders for uploaded files
app.use("/uploads/thumbnails", express.static(path.join(__dirname, "uploads/thumbnails")));
app.use("/uploads/videos", express.static(path.join(__dirname, "uploads/videos")));

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the LMS Backend API" });
});

app.use("/api/courses", courseRoutes); // Course routes mounted here

// Port
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
