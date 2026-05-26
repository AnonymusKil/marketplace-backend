import mongoose, { Document, Schema } from "mongoose";

interface Variant {
  size: string;
  quantity: number;
}

interface Products extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  seller: mongoose.Types.ObjectId;
  isActive: boolean;
  variants: Variant[];
}

const variantSchema = new Schema<Variant>(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
    },
  },
  { _id: false } // 👈 prevents Mongo from creating separate IDs for each variant
);

const productSchema = new Schema<Products>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [1, "Price must be greater than 0"],
    },
    category: {
      type: String,
      enum: ["Fashion", "Electronics", "Home", "Books", "Toys", "Sports", "Beauty"],
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      validate: {
        validator: function (value: string[]) {
          return value.length > 0 && value.length <= 4;
        },
        message: "A product must have between 1 and 4 images",
      },
    },
    seller: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 NEW
    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔥 VARIANTS (core change)
    variants: {
      type: [variantSchema],
      validate: {
        validator: function (value: Variant[]) {
          return value.length > 0;
        },
        message: "Product must have at least one variant",
      },
    },
  },
  { timestamps: true }
);

const Product = mongoose.model<Products>("Product", productSchema);
export default Product;