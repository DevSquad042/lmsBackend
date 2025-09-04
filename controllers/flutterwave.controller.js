import axios from "axios";
import Order from "../models/order.model.js";
import Enrollment from "../models/enrollment.model.js";
import Course from "../models/course.model.js";



// Initiate payment
export const initiatePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courses, totalAmount, email } = req.body;


    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: "At least one course must be selected" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "totalAmount is required and must be greater than 0" });
    }

    if (!email) {
      return res.status(400).json({ message: "Customer email is required" });
    }

    const tx_ref = `byway_${Date.now()}_${userId}`; // unique transaction reference

    const order = await Order.create({
      user: userId,
      courses: courses.map((c) => ({ course: c })),
      totalAmount,
      paymentStatus: "Pending",
      tx_ref,
    });


    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref,
        amount: totalAmount,
        currency: "NGN",
        redirect_url: `${process.env.SERVER_URL}/api/flutterwave/callback`,
        customer: {
          email,
          name: req.user.name || "User",
          phonenumber: req.user.phone || "08000000000",
        },
        customizations: {
          title: "Byway LMS",
          description: "Course Purchase",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );


    res.status(200).json({
      message: "Payment initiated successfully",
      checkoutLink: response.data.data.link,
      order,
    });
  } catch (err) {
    console.error("Payment initiation error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};


// Verify payment (callback/webhook)
export const verifyPayment = async (req, res) => {
  try {
    const { transaction_id } = req.query;

    if (!transaction_id) {
      return res.status(400).json({ message: "transaction_id is required" });
    }

    // Verify with Flutterwave API
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
      }
    );

    const data = response.data.data;

    if (data.status !== "successful") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    // Update order only if not already paid (idempotent)
    const order = await Order.findOneAndUpdate(
      { tx_ref: data.tx_ref, paymentStatus: { $ne: "Paid" } },
      { paymentStatus: "Paid" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found or already processed" });
    }

    // Enroll user in courses (upsert ensures idempotency)
    for (const c of order.courses) {
      await Enrollment.findOneAndUpdate(
        { user: order.user, course: c.course },
        {
          user: order.user,
          course: c.course,
          paymentreference: data.tx_ref,
          amount: data.amount,
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      message: "Payment verified & enrollment successful",
      order,
    });
  } catch (err) {
    console.error(" Payment verification error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
};


export const flutterwaveWebhook = async (req, res) => {
  try {
    const secretHash = process.env.FLW_SECRET_HASH; // set this in Flutterwave dashboard
    const signature = req.headers["verif-hash"];

    if (!signature || signature !== secretHash) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const payload = req.body;
    console.log("🔔 Webhook received:", payload);

    if (payload.event === "charge.completed" && payload.data.status === "successful") {
      const data = payload.data;

      // Update order only if not already paid
      const order = await Order.findOneAndUpdate(
        { tx_ref: data.tx_ref, paymentStatus: { $ne: "Paid" } },
        { paymentStatus: "Paid" },
        { new: true }
      );

      if (!order) {
        console.warn("⚠️ Order not found or already processed for tx_ref:", data.tx_ref);
        return res.status(200).json({ message: "Webhook ignored: Order already processed" });
      }

      // Enroll user in courses
      for (const c of order.courses) {
        await Enrollment.findOneAndUpdate(
          { user: order.user, course: c.course },
          {
            user: order.user,
            course: c.course,
            paymentreference: data.tx_ref,
            amount: data.amount,
          },
          { upsert: true, new: true }
        );
      }

      console.log("✅ Order updated & user enrolled:", order.tx_ref);
      return res.status(200).json({ message: "Webhook processed successfully", order });
    }

    // Ignore unrelated events
    res.status(200).json({ message: "Event ignored" });
  } catch (err) {
    console.error("❌ Webhook processing error:", err.message);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};


