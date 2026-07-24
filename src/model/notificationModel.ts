import mongoose, { Schema, Document } from "mongoose";

interface Notification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const notificationSchema = new Schema<Notification>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    title: String,

    message: String,

    read: {
      type: Boolean,

      default: false,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model<Notification>(
  "Notification",

  notificationSchema,
);
