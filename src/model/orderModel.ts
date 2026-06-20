import mongoose, { Schema, Document } from "mongoose";

interface OrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order extends Document {
  user: mongoose.Types.ObjectId;

  items: OrderItem[];

  subtotal: number;
  discount: number;
  total: number;

  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";

  payment: {
    method: "paystack" | "card" | "stripe";
    reference?: string;
    transactionRef?: string;
    paidAt?: Date;
  };
}

const orderSchema = new Schema<Order>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        image: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    payment: {
      method: {
        type: String,
        enum: ["paystack", "card", "stripe"],
      },

      reference: String,

      transactionRef: String,

      paidAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Order>("Order", orderSchema);