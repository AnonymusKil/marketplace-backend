import express from "express";
import crypto from "crypto";
import updateOrderStatus from "./updateOrderStatus.js";
import { verifyTransaction } from "./verifyTransaction.js";
const app = express();
app.use("/api/paystack/webhook", express.raw({ type: "application/json" }));
app.post("/api/paystack/webhook", async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not defined");
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body)
    .digest("hex");

  const signature = req.headers["x-paystack-signature"];

  // 1. Verify request is from Paystack
  if (hash !== signature) {
    return res.status(401).send("Unauthorized webhook");
  }

  // 2. Parse event
  const event = JSON.parse(req.body.toString());

  console.log("Paystack event:", event);

  // 3. Handle successful payment
  if (event.event === "charge.success") {
    const reference = event.data.reference;

    await verifyTransaction(reference);

    await updateOrderStatus(reference, "paid");
  }
 console.log("🔥 WEBHOOK HIT:", req.body);
  res.sendStatus(200);
});
