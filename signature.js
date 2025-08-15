import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

console.log("Loaded secret:", process.env.PAYSTACK_SECRET_KEY); // should print your key
const secret = process.env.PAYSTACK_SECRET_KEY;

const rawPayload = JSON.stringify({
  event: "charge.success",
  data: {
    status: "success",
    amount: 500000,
    reference: "TEST12345",
    metadata: {
      userId: "689cf333d9377b048e928719",
      courseId: "6895fda5ef5fc1bf0a804de3"
    }
  }
});

const signature = crypto
  .createHmac("sha512", secret)
  .update(rawPayload)
  .digest("hex");

(async () => {
  try {
    const res = await axios.post(
      "http://localhost:3000/api/payments/webhook",
      rawPayload, // send raw JSON string
      {
        headers: {
          "Content-Type": "application/json",
          "x-paystack-signature": signature
        }
      }
    );
    console.log("Response status:", res.status);
  } catch (err) {
    
    console.error("Error:", err);
  }
})();
