import express from "express";
const paymentRouter = express.Router();
import bodyParser from "body-parser";
import { initializePayment, verifyPayment, paystackWebhook } from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

paymentRouter.use(verifyToken);
paymentRouter.post("/initiate", initializePayment);
paymentRouter.get("/verify/:reference", verifyPayment);




export default paymentRouter;
