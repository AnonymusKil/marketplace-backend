import mongoose, { Document, Schema } from "mongoose";

interface Products extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  publicId: string;
  seller: mongoose.Types.ObjectId;
}

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
      enum: [
        "Electronics",
        "Clothing",
        "Home & Kitchen",
        "Beauty & Health",
        "Toys & Games",
        "Sports & Outdoors",
        "Books & Media",
        "Food & Drink",
      ],
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
    publicId: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model<Products>("Product", productSchema);
export default Product;
