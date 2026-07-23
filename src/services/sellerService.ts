import { getIO } from "../config/Socket.js";
import sellerModel from "../model/sellerModel.js";
import Usermodel from "../model/Usermodel.js";
import notificationModel from "../model/notificationModel.js";
interface SellerInput {
  storeName: string;
  description: string;
  businessEmail: string;
  businessPhone: string;
  businessLogo: string;
  businessAddress: string;
  publicId: string;
}

interface SellerResponse {
  message: string;
  sellerStatus: string;
}

// ⚠️ Remove Request/Response — not needed in GraphQL
export async function becomeASeller(
  data: SellerInput,
  context: any,
): Promise<SellerResponse> {
  const {
    storeName,
    description,
    businessEmail,
    businessPhone,
    businessLogo,
    businessAddress,
    publicId,
  } = data;

  // 🔐 Auth
  const owner = context?.user?.userId;
  if (!owner) throw new Error("Not authenticated");

  // 🧾 Validate input
  if (
    !storeName ||
    !description ||
    !businessEmail ||
    !businessPhone ||
    !businessAddress
  ) {
    throw new Error("All fields are required");
  }

  // 👤 Check user
  const finduser = await Usermodel.findById(owner);
  if (!finduser) throw new Error("User not found");

  if (finduser.sellerStatus === "pending") {
    throw new Error("Application already under review");
  }

  if (finduser.sellerStatus === "approved") {
    throw new Error("You are already a seller");
  }

  const existingSeller = await sellerModel.findOne({ owner });
  if (existingSeller) {
    throw new Error("Seller profile already exists");
  }

  const newSeller = new sellerModel({
    storeName,
    description,
    owner,
    businessEmail,
    businessPhone: businessPhone.trim(),
    businessAddress,
    businessLogo,
    publicId,
  });

  await newSeller.save();

  finduser.sellerStatus = "pending";
  await finduser.save();

  const notification = {
    user: owner,
    title: "Seller Application Submitted",
    message:
      "Your seller application has been received successfully and is currently under review. You will be notified once a decision has been made.",
    read: false,
  };

  await notificationModel.create(notification);

  const io = getIO();

  io.to(owner).emit("notification", notification);
  return {
    message: "Application submitted successfully",
    sellerStatus: finduser.sellerStatus,
  };
}
