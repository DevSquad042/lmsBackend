import axios from "axios";
import crypto from "crypto";
import Order from '../models/order.model.js'
import Enrollment from "../models/enrollment.model.js";



export const initializePayment = async (req, res) => {
    const { amount, email, courseId } = req.body;
    const userId = req.user.id;

    if (!amount || !email || !userId || !courseId) {
        return res.status(400).json({ message: "Amount, email, userId, and courseId are required" });
    };

    try {
        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email,
                amount: amount * 100, // Paystack expects kobo
                metadata: { userId, courseId }, // important!
                callback_url: `${process.env.FRONTEND_URL}/payment-success`
            },
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
            }
        );
        res.status(200).json({
            message: "Payment initialized",
            data: response.data.data // Contains authorization_url, reference, etc.
        });
    } catch (error) {
        res.status(500).json({
            message: "Payment initialization failed",
            error: error.response?.data || error.message
        });
    }
};


// - Manual Payment Verification 
export const verifyPayment = async (req, res) => {
    const { reference } = req.params;

    if (!reference) return res.status(400).json({ message: "Payment reference is required" });

    try {
        // Verify with Paystack
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        });

        const paymentData = response.data.data;

        if (paymentData.status !== "success")
            return res.status(400).json({ message: "Payment not successful" });

        const { userId, courseId } = paymentData.metadata;
        const amount = paymentData.amount / 100;

        // Create order if not exists
        const existingOrder = await Order.findOne({ "courses.course": courseId, user: userId });
        if (!existingOrder) {
            await Order.create({
                user: userId,
                courses: [{ course: courseId }],
                totalAmount: amount,
                paymentStatus: "Paid",
            });
        }

        // Create enrollment if not exists
        const enrollmentExists = await Enrollment.findOne({ user: userId, course: courseId });
        if (!enrollmentExists) {

            await Enrollment.create(
                {
                    user: userId,
                    course: courseId,
                    enrolledAt: new Date(),
                    paymentreference: reference,
                    amount: amount
                });
        }

        res.status(200).json({ message: "Payment verified and enrollment successful" });
    } catch (error) {
        res.status(500).json({ message: "Payment verification failed", error: error.response?.data || error.message });
    }
};

// -Paystack Webhook -

export const paystackWebhook = async (req, res) => {
  try {
    // Raw body should be a Buffer from bodyParser.raw
    const rawBody = req.body;

    // Generate signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    console.log("Generated hash:", hash);
    console.log("Paystack header:", req.headers["x-paystack-signature"]);

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    // Parse the raw body after verifying signature
    const event = JSON.parse(rawBody.toString());

    if (event.event === "charge.success" && event.data.status === "success") {
      const paymentData = event.data;
      const { userId, courseId } = paymentData.metadata;
      const amount = paymentData.amount / 100;

      const existingOrder = await Order.findOne({
        "courses.course": courseId,
        user: userId
      });

      if (!existingOrder) {
        await Order.create({
          user: userId,
          courses: [{ course: courseId }],
          totalAmount: amount,
          paymentStatus: "Paid"
        });
      }

      const enrollmentExists = await Enrollment.findOne({
        user: userId,
        course: courseId
      });

      if (!enrollmentExists) {
        await Enrollment.create({
          user: userId,
          course: courseId,
          enrolledAt: new Date(),
          paymentreference: paymentData.reference
        });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.sendStatus(500);
  }
};

