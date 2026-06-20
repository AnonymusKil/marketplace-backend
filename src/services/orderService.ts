import orderModel from "../model/orderModel.js";
import CouponModel from "../model/couponModel.js";
import Cart from "../model/cartModel.js";
import Seller from "../model/sellerModel.js";

interface CreateOrderInput {
  couponCode?: string;
  paymentMethod: "card" | "paystack" | "stripe";

  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    emailAddress: string;
    address: string;
    city: string;
    state: string;
    country: string;
    street: string;
    zipCode: string;
  };
}

interface OrderResponse {
  message: string;
  order: any;
}

export async function createUserOrder(
  data: CreateOrderInput,
  context: any,
): Promise<OrderResponse> {
  try {
    const { couponCode, paymentMethod, shippingAddress } = data;

    if (
      !paymentMethod ||
      !["card", "paystack", "stripe"].includes(paymentMethod)
    ) {
      throw new Error("Invalid payment method");
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phoneNumber ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.country ||
      !shippingAddress?.street ||
      !shippingAddress?.emailAddress 
    ) {
      throw new Error("All shipping address fields are required");
    }

    const userId = context?.user?.userId;
    if (!userId) throw new Error("Not authenticated");

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      populate: {
        path: "seller",
        model: "Seller",
      },
    });

    if (!cart) throw new Error("Cart not found");
    if (cart.items.length === 0) throw new Error("Cart is empty");

    const seller = await Seller.findOne({ owner: userId });

    if (seller) {
      for (const item of cart.items) {
        const product = item.product as any;

        if (product?.seller?.owner?.toString() === userId) {
          throw new Error("You can't purchase your own products");
        }
      }
    }

    const orderItems = cart.items.map((item: any) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.priceAtAdd,
      image: item.product?.images?.[0] || "",
      name: item.product?.name || "",
    }));

    const subtotal = cart.totalPrice;

    let discountAmount = 0;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        couponCode: couponCode.trim().toUpperCase(),
      });

      if (!coupon) {
        throw new Error("Invalid Coupon Code");
      }

      if (new Date(coupon.expiryDate) < new Date()) {
        throw new Error("Coupon code has expired");
      }

      if (!coupon.isActive) {
        throw new Error("Coupon code is not active");
      }

      if (coupon.usedCount >= coupon.maxUses) {
        throw new Error("Coupon code has reached maximum uses");
      }

      if (coupon.discountType === "percentage") {
        discountAmount = (subtotal * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }

      coupon.usedCount += 1;
      await coupon.save();
    }

    const totalAmount = Math.max(subtotal - discountAmount, 0);

    const order = await orderModel.create({
      user: userId,

      items: orderItems,

      subtotal,

      total: totalAmount,

      discount: discountAmount,

      shippingAddress,

      status: "pending",

      payment: {
        method: paymentMethod,
        transactionRef: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      },
    });

    return {
      message: "Order created successfully",
      order,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
