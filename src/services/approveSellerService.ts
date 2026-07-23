// Approve Seller Service
import { getIO } from "../config/Socket.js";
import sellerModel from "../model/sellerModel.js";
import Usermodel from "../model/Usermodel.js";
import notificationModel from "../model/notificationModel.js";
interface ApproveSellerInput {
  sellerId: string;
  sellerStatus: "approved" | "rejected";
}
interface ApproveSellerResponse {
  message: string;
  sellerStatus: string;
}

export async function approveSeller(
  data: ApproveSellerInput,
  context: any,
): Promise<ApproveSellerResponse> {
  const { sellerId, sellerStatus } = data;
  // 🔐 Auth
  const adminId = context?.user?.userId;
  const userRole = context?.user?.role;
  if (!adminId || userRole !== "admin") {
    throw new Error("Not authorized");
  }

  if (!sellerId || !sellerStatus) {
    throw new Error("Seller ID and status are required");
  }
  const seller = await sellerModel
    .findById(sellerId)
    .select("businessEmail owner");
  if (!seller) {
    throw new Error("Seller not found");
  }
  const userId = seller.owner.toString();
  const user = await Usermodel.findById(seller.owner);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.sellerStatus === sellerStatus) {
    throw new Error(`Seller is already ${sellerStatus}`);
  }
  user.sellerStatus = sellerStatus;
  if (sellerStatus === "approved") {
    user.role = "seller";
  } else if (sellerStatus === "rejected") {
    user.role = "user";
  }
  await user.save();

  const notification = {
    user: seller.owner,
    title:
      sellerStatus === "approved"
        ? "Seller Application Approved"
        : "Seller Application Rejected",
    message:
      sellerStatus === "approved"
        ? "Congratulations! Your seller application has been approved. You can now start listing and selling products on GoCart."
        : "Unfortunately, your seller application was not approved at this time. Please review your application details and try again.",
    read: false,
  };
  const savedNotification = await notificationModel.create(notification);
  const io = getIO();
  io.to(userId).emit("notification", savedNotification);
  return {
    message: `Seller has been ${sellerStatus}`,
    sellerStatus,
  };
}
