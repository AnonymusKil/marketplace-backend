import axios from "axios";
import { getIO } from "../config/Socket.js";
import orderModel from "../model/orderModel.js";
import User from "../model/Usermodel.js";
import notificationModel from "../model/notificationModel.js";
interface CheckOutInput {
  orderID: string;
}

export async function initializeTransaction(
  { orderID }: CheckOutInput,
  context: any,
) {
  const userID = context?.user?.userId;

  if (!userID) throw new Error("Not authenticated");

  const user = await User.findById(userID);
  if (!user) throw new Error("User not found");

  const order = await orderModel.findById(orderID);
  if (!order) throw new Error("Order not found");

  // 🔒 ensure ownership
  if (order.user.toString() !== userID) {
    throw new Error("Unauthorized order access");
  }

  if (order.paymentStatus === "paid") {
    throw new Error("Order already paid");
  }

  const email = user.email;

  const reference = `order_${orderID}_${Date.now()}`;

  // save reference BEFORE payment
  order.payment = {
    method: "paystack",
    reference: reference,
  };

  await order.save();

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email,
      amount: order.total * 100,
      reference,
      callback_url: "https://marketplace-frontend-one-sage.vercel.app",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  const notification = {
    user: userID,
    title: "Payment Initiated",
    message:
      "Your payment session has been created successfully. Complete your payment to confirm your order.",
    read: false,
  };

  await notificationModel.create(notification);
  const io = getIO();
  io.to(userID).emit("notification", notification);

  return {
    authorization_url: response.data.data.authorization_url,
    reference,
    message: "Payment initialized successfully",
  };
}
