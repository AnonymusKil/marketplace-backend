import couponModel from "../model/couponModel.js";
import Cart from "../model/cartModel.js";
interface ApplyCouponCodeInput {
  couponCode: string;
  userId: string;
}
interface CouponCodeResponse {
  message: string;
  discountAmount: number;
  newTotal: number;
}
async function applyCouponCode(
  data: ApplyCouponCodeInput,
): Promise<CouponCodeResponse> {
  const { couponCode, userId } = data;
  if (!couponCode) throw new Error("Coupon code is required");
  const coupon = await couponModel.findOne({
    couponCode: couponCode.trim().toUpperCase(),
  });
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("No cart found for this user");

  const cartTotal = cart.items.reduce((sum, item) => {
    return sum + item.priceAtAdd * item.quantity;
  }, 0);
  if (!coupon) throw new Error("Invalid coupon code");
  const expirtyDate = coupon.expiryDate;
  if (expirtyDate < new Date()) throw new Error("Coupon code has expired");
  if (!coupon.isActive) throw new Error("Coupon code is not active");
  if (coupon.usedCount >= coupon.maxUses)
    throw new Error("Coupon code has reached maximum uses");
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
  } else if (coupon.discountType === "fixed") {
    discountAmount = coupon.discountValue;
  }

  // prevent negative money in a case where discountAmount is bigger than cartAmount
  const newTotal = Math.max(cartTotal - discountAmount, 0);

  return {
    message: "Coupon applied successfully",
    discountAmount,
    newTotal,
  };
}
export default applyCouponCode