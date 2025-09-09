import express from "express";
import { initiatePayment, verifyPayment, flutterwaveWebhook } from "../controllers/flutterwave.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";


const flutterwaveRouter = express.Router();

// normal payment flow
flutterwaveRouter.post("/initiate", verifyToken, initiatePayment);
flutterwaveRouter.get("/callback", verifyPayment);

// webhook (Flutterwave will call this directly)
flutterwaveRouter.post("/webhook", express.json({ type: "application/json" }), flutterwaveWebhook);

export default flutterwaveRouter;

