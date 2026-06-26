import orderModel from "../model/orderModel.js";

const updateOrderStatus = async (reference: string, status: string) => {
  await orderModel.findOneAndUpdate(
    { "payment.reference": reference },
    {
      paymentStatus: status === "paid" ? "paid" : "failed",
    },
  );
};
export default updateOrderStatus;
