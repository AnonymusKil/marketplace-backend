import mongoose, { Schema, Document } from "mongoose";

interface CartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  priceAtAdd: number;
}

interface Cart extends Document {
  user: mongoose.Types.ObjectId;
  items: CartItem[];
  totalPrice: number;
  updatedAt: Date;
}

const cartSchema = new Schema<Cart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtAdd: {
          type: Number,
          required: true,
        },
      },
    ],

    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);
const Cart = mongoose.model<Cart>("Cart", cartSchema);
export default Cart;
