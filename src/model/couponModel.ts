import mongoose, { Schema, Document } from "mongoose";
interface Coupon extends Document {
  couponCode: string;
  expiryDate: Date;
  couponDescription: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  maxUses: number;
  usedCount: number;
  maxUsesPerUser: number;
}

const couponSchema = new Schema<Coupon>(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    couponDescription: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUses: {
      type: Number,
      default: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    maxUsesPerUser: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);
const CouponModel = mongoose.model<Coupon>("Coupon", couponSchema);
export default CouponModel;
