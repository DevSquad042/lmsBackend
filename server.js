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
import orderRoutes from "./routes/order.route.js";
import courseRoutes from "./routes/course.route.js"
import cartRouter from "./routes/cart.route.js";
import cookieParser from 'cookie-parser';
import reviewrouter from "./routes/reviewroute.js";
import enrollmentRoutes from './routes/enrollment.routes.js';


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

app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/courses', courseRoutes)
app.use('/api/cart', cartRouter);
app.use('/api/review', reviewrouter);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
const PORT = process.env.PORT;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
