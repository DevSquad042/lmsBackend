import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

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

console.log("Generated signature:", signature);
console.log("Payload to use in Postman:", rawPayload);
