import {approveSeller} from "../../services/approveSellerService.js";

const approveSellerResolver = {
    Mutation: {
        approveSeller: async(_: any, { input }: any, context: any) => {
            try{
                const { sellerId, sellerStatus } = input;
                const response = await approveSeller(
                    {
                        sellerId,
                        sellerStatus
                    },
                    context
                );
                return {
                    message: response.message,
                    sellerStatus: response.sellerStatus,
                };

            }catch(error: any){
                return {
                    message: error.message || "Server error",
                    sellerStatus: "Failed",
                  };
            }
        }

    }
}
export default approveSellerResolver;