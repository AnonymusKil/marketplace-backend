import CouponModel from "../model/couponModel.js";
interface CreateCouponInput {
  couponCode: string;
  expiryDate: Date;
  couponDescription: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  maxUses: number;
}

interface CreateCouponResponse {
  message: string;
  couponCode: string;
}

export async function createCoupon(
  data: CreateCouponInput, context: any
): Promise<CreateCouponResponse> {
   
  const adminId = context?.user?.userId;
  const userRole = context?.user?.role;
   if (!adminId || userRole !== "admin") {
    throw new Error("Not authorized");
  }
  const {
    couponCode,
    expiryDate,
    couponDescription,
    discountType,
    discountValue,
    isActive,
    maxUses,
  } = data;

  if (
    !couponCode ||
    !expiryDate ||
    !couponDescription ||
    !discountType ||
    discountValue === undefined ||
    isActive === undefined ||
    maxUses === undefined
  ) {
    throw new Error(
      "couponCode, expiryDate, couponDescription, discountType, discountValue, isActive and maxUses are required",
    );
  }

  if (new Date(expiryDate) <= new Date()) {
    throw new Error("Expiry date must be in the future");
  }

  if (
    discountType === "percentage" &&
    (discountValue <= 0 || discountValue > 100)
  ) {
    throw new Error("Percentage discount must be between 1 and 100");
  }

  if (discountType === "fixed" && discountValue <= 0) {
    throw new Error("Fixed discount must be greater than 0");
  }

  if (maxUses <= 0) {
    throw new Error("Max uses must be greater than 0");
  }

  const existingCoupon = await CouponModel.findOne({
    couponCode: couponCode.toUpperCase(),
  });

  if (existingCoupon) {
    throw new Error("Coupon code already exists");
  }

  const coupon = await CouponModel.create({
    couponCode: couponCode.toUpperCase(),
    expiryDate,
    couponDescription,
    discountType,
    discountValue,
    isActive,
    maxUses,
  });

  return {
    message: "Coupon created successfully",
    couponCode: coupon.couponCode,
  };
}