import axios from "axios";
import orderModel from "../model/orderModel.js";
import Cart from "../model/cartModel.js";
interface VerifyPayment {
  reference: string;
}

export async function verifyTransaction({ reference }: VerifyPayment) {
  if (!reference) {
    throw new Error("Missing reference");
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const paymentData = response.data.data;

    if (paymentData.status === "success") {
      const order = await orderModel.findOneAndUpdate(
        { "payment.reference": reference },
        {
          paymentStatus: "paid",
          "payment.paidAt": new Date(),
        },
        { new: true },
      );

      if (!order) {
        throw new Error("Order not found");
      }

      await Cart.findOneAndUpdate(
        { user: order.user },
        {
          items: [],
          totalPrice: 0,
        },
      );
      return {
        message: "Payment verified successfully",
        status: paymentData.status,
        reference,
      };
    } else {
      return {
        message: "Payment not successful",
      };
    }
  } catch (error: any) {
    return {
      message: "Verification failed",
      error: error.message,
    };
  }
}
