import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import connectDB from "./config/db.js";
import orderRoutes from "./routes/order.route.js";
import courseRoutes from "./routes/course.route.js"
import cartRouter from "./routes/cart.route.js";
import cookieParser from 'cookie-parser';


dotenv.config();
const app = express();


app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the LMS Backend API" });
});

app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/courses', courseRoutes)
app.use('/api/cart', cartRouter);
const PORT = process.env.PORT || 3000;

connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

