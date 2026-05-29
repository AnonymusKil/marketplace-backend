import mongoose, { Document, Schema } from "mongoose";

interface Seller extends Document {
  storeName: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  businessEmail: string;
  businessPhone: string;
  businessLogo: string;
  businessAddress: string;
  publicId: string;
}

const sellerSchema = new Schema<Seller>({
  storeName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  businessPhone: {
    type: String,
    required: true,
  },
  businessAddress: {
    type: String,
    required: true,
    trim: true,
  },
  businessLogo: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
});
const Seller = mongoose.model<Seller>("Seller", sellerSchema);

export default Seller;
