import { Router } from "express";
import express from "express";
import crypto from "crypto";
import { getIO } from "../config/Socket.js";
import updateOrderStatus from "./updateOrderStatus.js";
import notificationModel from "../model/notificationModel.js";
import orderModel from "../model/orderModel.js";
import sellerModel from "../model/sellerModel.js";
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

        // Verify payment
        await verifyTransaction({ reference });

        // Update order payment status
        await updateOrderStatus(reference, "paid");

        // Find the paid order
        const order = await orderModel
          .findOne({ "payment.reference": reference })
          .populate("user")
          .populate("items.product");

        if (!order) {
          throw new Error("Order not found");
        }
        const notification = {
          user: order.user._id,
          title: "Payment Successful",
          message:
            "Your payment has been received successfully. Your order has been confirmed and is now being processed.",
          read: false,
        };

        await notificationModel.create(notification);

        const io = getIO();

        io.to(order.user._id.toString()).emit("notification", notification);
        const sellers = new Set<string>();
        order.items.forEach((item) => {
          const product = item.product as any;

          if (product && product.seller) {
            sellers.add(product.seller.toString());
          }
        });
        for(const sellerId of sellers) {
          const sellerNotification = {
            user: sellerId,
            title: "New Order Received",
            message: `You have received a new order for your product(s). Please check your seller dashboard for details.`,
            read: false,
          };
          await notificationModel.create(sellerNotification);
          io.to(sellerId).emit("notification", sellerNotification);
        }
        console.log("✅ Order updated:", reference);
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
  },
);

export default router;
