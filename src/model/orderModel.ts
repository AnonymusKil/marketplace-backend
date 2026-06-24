import mongoose, { Schema, Document } from "mongoose";

interface OrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
  city: string;
  state: string;
  country: string;
  street: string;
  zipCode: string;
}

interface Order extends Document {
  user: mongoose.Types.ObjectId;

  items: OrderItem[];

  subtotal: number;
  discount: number;
  total: number;

  shippingAddress: ShippingAddress;

  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";

  payment: {
    method: "paystack" | "card" | "stripe";
    reference?: string;
    transactionRef?: string;
    paidAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
  couponCode: string | null;
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
    couponCode: {
      type: String,
      default: null,
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },

      phoneNumber: {
        type: String,
        required: true,
      },

      emailAddress: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      country: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
      },
    },

    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
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
  },
);

export default mongoose.model<Order>("Order", orderSchema);
