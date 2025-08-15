import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import reviewrouter from "./routes/reviewroute.js";
import enrollmentRoutes from './routes/enrollment.route.js';


dotenv.config();
const app = express();


app.post(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }),
  paystackWebhook
);

// --- Regular middleware for all routes except webhook ---
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev")); // optional logging

// --- Routes ---
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the LMS Backend API" });
});

app.use('/api/auth', authRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/cart', cartRouter);
app.use('/api/review', reviewrouter);
app.use('/api/enrollments', enrollmentRoutes);
const PORT = process.env.PORT;

// --- Connect DB and start server ---
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
