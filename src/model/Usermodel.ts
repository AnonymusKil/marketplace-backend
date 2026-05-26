import mongoose, { Document, Schema } from "mongoose";

interface User extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "seller" | "admin";
  sellerStatus:  "none" | "pending" | "approved" | "rejected";
}
const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    sellerStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<User>("User", userSchema);

export default User;
