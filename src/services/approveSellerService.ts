// Approve Seller Service
import sellerModel from "../model/sellerModel.js";
import Usermodel from "../model/Usermodel.js";
import {sellerDecisionEmailTemplate} from "../email/approveSellerEmail.js";
import { sendSellerApplicationEmail } from "./sellerEmailService.js";
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
  const { sellerId, sellerStatus} = data;
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

  const user = await Usermodel.findById(seller.owner);
  if (!user) {
    throw new Error("User not found");
  }
  if(user.sellerStatus === sellerStatus){
    throw new Error(`Seller is already ${sellerStatus}`);
  }
  user.sellerStatus = sellerStatus;
  if(sellerStatus === "approved"){
    user.role = "seller";
  }else if(sellerStatus === "rejected"){
    user.role = "user";
  }
  await user.save();

  const businessEmail = seller.businessEmail;
  
    
  // Optionally, send an email notification to the seller about the approval/rejection
  // 📧 Email (unchanged — good job here)
  const {subject, html} = sellerDecisionEmailTemplate(
    sellerStatus,
    user.name,
  );
  await sendSellerApplicationEmail(businessEmail, subject, html);

  return {
    message: `Seller has been ${sellerStatus}`,
    sellerStatus,
  };

  
}
