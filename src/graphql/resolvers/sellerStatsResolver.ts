import { GraphQLError } from "graphql";

import Review from "../../model/reviewModel.js";
import Product from "../../model/productModel.js";
import { writeReview } from "../../services/reviewService.js";
import Seller from "../../model/sellerModel.js";
import orderModel from "../../model/orderModel.js";
const sellerStats = {
  Query: {
    sellerOrderStats: async (_: any, __: any, context: any) => {
      try {
        if (!context.user) {
          throw new GraphQLError("Unauthorized", {
            extensions: {
              code: "UNAUTHENTICATED",
            },
          });
        }
        const userRole = context?.user?.role;
        const userId = context?.user?.userId;
        if (userRole !== "seller") {
          throw new GraphQLError("Forbidden", {
            extensions: { code: "FORBIDDEN" },
          });
        }

        const seller = await Seller.findOne({ owner: userId });
        if (!seller) throw new Error("Seller not found");
        const product = await Product.find({ seller: seller._id });
        const productIds = product.map((productid) => productid._id);
        const orders = await orderModel.find({
          "items.product": { $in: productIds },
          status: "paid",
        });
        let totalOrders = orders.length;
        let totalProducts = product.length;
        let totalEarnings = 0;
        let totalItemsSold = 0;
        for (const order of orders) {
          for (const item of order.items) {
            if (
              productIds.some((id) => id.toString() === item.product.toString())
            ) {
              totalEarnings += item.price * item.quantity;
              totalItemsSold += item.quantity;
            }
          }
        }
        return {
          totalOrders,
          totalEarnings,
          totalItemsSold,
          totalProducts,
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
    adminAnalytics: async (_: any, __: any, context: any) => {
      try {
        if (!context.user) {
          throw new GraphQLError("Unauthorized", {
            extensions: {
              code: "UNAUTHENTICATED",
            },
          });
        }
        const userRole = context?.user?.role;
        if (userRole !== "admin") {
          throw new GraphQLError("Forbidden", {
            extensions: { code: "FORBIDDEN" },
          });
        }
        const totalProducts = await Product.countDocuments();
        const totalStores = await Seller.countDocuments();
        const orders = await orderModel.find({status: "paid"})
        let totalOrders = orders.length
        let totalRevenue = 0
        for (const order of orders){
          totalRevenue += order.total || 0
        }
        return {
          totalOrders,
          totalRevenue,
          totalStores,
          totalProducts
        }

      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
  },
};
export default sellerStats;
