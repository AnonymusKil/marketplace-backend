import { GraphQLError } from "graphql";
import Usermodel from "../../model/Usermodel.js";
import sellerModel from "../../model/sellerModel.js";
import { approveSeller } from "../../services/approveSellerService.js";

const approveSellerResolver = {
  Query: {
    sellerProfile: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }
      const user = await Usermodel.findById(context.user.userId);
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "NOT_FOUND",
          },
        });
      }
      if (user.sellerStatus !== "approved") {
        throw new GraphQLError("Seller profile not found", {
          extensions: {
            code: "NOT_FOUND",
          },
        });
      }
      const seller = await sellerModel.findOne({ owner: context.user.userId });
      if (!seller) {
        throw new GraphQLError("Seller profile not found", {
          extensions: {
            code: "NOT_FOUND",
          },
        });
      }
      console.log("RAW SELLER:", seller);
      console.log("BUSINESS ADDRESS:", seller.businessAddress);
      console.log("BUSINESS LOGO:", seller.businessLogo);
      console.log("BUSINESS EMAIL:", seller.businessEmail);
      console.log("BUSINESS NAME:", seller.storeName);
      console.log("BUSINESS PHONE:", seller.description);
      const sellerObj = seller.toObject();

      return {
        id: sellerObj._id.toString(),
        storeName: sellerObj.storeName,
        description: sellerObj.description,
        owner: sellerObj.owner,
        businessEmail: sellerObj.businessEmail,
        businessPhone: sellerObj.businessPhone,
        businessLogo: sellerObj.businessLogo,
        businessAddress: sellerObj.businessAddress,
        publicId: sellerObj.publicId,
        user: {
            ...user.toObject(),
            id: user._id.toString(),
        }
        
      };
    },
  },
  Mutation: {
    approveSeller: async (_: any, { input }: any, context: any) => {
      try {
        const { sellerId, sellerStatus } = input;
        const response = await approveSeller(
          {
            sellerId,
            sellerStatus,
          },
          context,
        );
        return {
          message: response.message,
          sellerStatus: response.sellerStatus,
        };
      } catch (error: any) {
        return {
          message: error.message || "Server error",
          sellerStatus: "Failed",
        };
      }
    },
  },
};
export default approveSellerResolver;
