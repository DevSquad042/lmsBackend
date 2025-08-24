import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import reviewrouter from "./routes/review.route.js"
import enrollmentRoutes from "./routes/enrollment.route.js";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import orderRoutes from "./routes/order.route.js";
import courseRoutes from "./routes/course.route.js";
import cartRouter from "./routes/cart.route.js";
import paymentRouter from "./routes/payment.route.js";
import { paystackWebhook } from "./controllers/payment.controller.js";
import chatRoutes from "./routes/chat.route.js";


dotenv.config();
const app = express();

const limiter = rateLimit({
  max: 50,
  windowsMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in a hour!" 
});


app.use(
  cors({
    origin: process.env.CLIENT_URL, 
    credentials: true,
  })
);

app.post(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }),
  paystackWebhook
);

// --- Regular middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// --- Routes ---
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the LMS Backend API" });
});

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/cart', cartRouter);
app.use('/api', limiter);
app.use('/api/review', reviewrouter);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/chats', chatRoutes);

const PORT = process.env.PORT;

// --- Connect DB and start server ---
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



