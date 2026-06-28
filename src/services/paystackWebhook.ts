import { Router } from "express";
import express from "express";
import crypto from "crypto";
import updateOrderStatus from "./updateOrderStatus.js";
import { verifyTransaction } from "./verifyTransaction.js";

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const secret = process.env.PAYSTACK_SECRET_KEY;

      if (!secret) {
        throw new Error("PAYSTACK_SECRET_KEY is not defined");
      }

      const signature = req.headers["x-paystack-signature"];

      const hash = crypto
        .createHmac("sha512", secret)
        .update(req.body)
        .digest("hex");

      if (hash !== signature) {
        return res.status(401).send("Unauthorized webhook");
      }

      const event = JSON.parse(req.body.toString());

      console.log("🔥 WEBHOOK HIT");
      console.log("Paystack Event:", event);

      if (event.event === "charge.success") {
        const reference = event.data.reference;

        // await verifyTransaction({reference});
        await updateOrderStatus(reference, "paid");
        await verifyTransaction({reference})
        

        console.log("✅ Order updated:", reference);
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
  }
);

export default router;