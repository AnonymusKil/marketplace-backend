import mongoose, { Document, Schema } from "mongoose";

interface Reviews extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<Reviews>({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  
}, {timestamps:true});

const Review = mongoose.model<Reviews>("Reviews", ReviewSchema )
export default Review