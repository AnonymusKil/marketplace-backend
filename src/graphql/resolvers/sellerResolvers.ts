import { becomeASeller } from "../../services/sellerService.js";

const sellerResolvers = {
  Mutation: {
    becomeASeller: async (_: any, { input }: any, context: any) => {
      try {
        const {
          storeName,
          description,
          businessEmail,
          businessPhone,
          businessLogo,
          businessAddress,
          publicId
        } = input;
        // const firstResponse = await becomeASeller(input, context);
        console.log("🔥 Resolver HIT");
        console.log("INPUT:", input);
        const response = await becomeASeller(
          {
            storeName,
            description,
            businessEmail,
            businessPhone,
            businessAddress,
            businessLogo,
            publicId
          },
          context,
        );
        console.log("Seller application response:", response);
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
export default sellerResolvers;
