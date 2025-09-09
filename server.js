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
import profileRouter from "./routes/profile.route.js";
import instructorsRoute from "./routes/instructors.route.js";
import enrolledCoursesRouter from "./routes/enrolledCourses.route.js";
import searchCoursesRoute from "./routes/searchCourses.routes.js";
import progressRouter from "./routes/progress.route.js";


dotenv.config();
const app = express();

const limiter = rateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in a hour!" 
});


const allowedOrigins = [
  process.env.CLIENT_URL, 
  "https://byway1.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
app.use('/api/payments', paymentRouter);
app.use('/api/profile', profileRouter); //
app.use('/api/instructors', instructorsRoute); //
app.use('/api/enrolled-courses', enrolledCoursesRouter);
app.use('/api/search', searchCoursesRoute); //
app.use('/api/progress', progressRouter);

const PORT = process.env.PORT;

// --- Connect DB and start server ---
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



