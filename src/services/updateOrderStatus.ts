import orderModel from "../model/orderModel.js";
import Cart from "../model/cartModel.js";

const updateOrderStatus = async (reference: string, status: string) => {
  const order = await orderModel.findOneAndUpdate(
    { "payment.reference": reference },
    {
      paymentStatus: status === "paid" ? "paid" : "failed",
    },
  );
  await Cart.findOneAndUpdate(
    { user: order!.user },
    {
      items: [],
      totalPrice: 0,
    },
  );
};
export default updateOrderStatus;
