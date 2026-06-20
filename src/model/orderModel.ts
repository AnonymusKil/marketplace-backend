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

  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";

  payment: {
    method: "paystack" | "card" | "stripe";
    reference?: string;
    transactionRef?: string;
    paidAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;

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
  },
);

export default mongoose.model<Order>("Order", orderSchema);
