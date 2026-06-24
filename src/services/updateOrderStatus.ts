import orderModel from "../model/orderModel.js";

const updateOrderStatus = async (reference: string, status: string) => {
  await orderModel.findOneAndUpdate(
    { reference },
    {
      paymentStatus: status === "paid" ? "PAID" : "FAILED",
    },
  );
};
export default updateOrderStatus