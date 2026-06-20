import { GraphQLError } from "graphql";
import orderModel from "../../model/orderModel.js";
import Review from "../../model/reviewModel.js";
import Product from "../../model/productModel.js";
import { writeReview } from "../../services/reviewService.js";
import Seller from "../../model/sellerModel.js";
const reviewResolver = {
  Query: {
    getProductReviews: async (_: any, { productId }: { productId: string }) => {
      try {
        if (!productId) {
          throw new Error("Product ID is required");
        }

        const product = await Product.findById(productId);
        if (!product) {
          throw new Error("Product not found");
        }

        const reviews = await Review.find({ product: productId })
          .populate("user")
          .populate("product")
          .sort({ createdAt: -1 });

        return reviews.map((review) => ({
          id: review._id.toString(),
          content: review.content || "",
          rating: review.rating || 0,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,

          user: review.user
            ? {
                id: (review.user as any)._id.toString(),
                name: (review.user as any).name || "Unknown",
                email: (review.user as any).email || "",
                role: (review.user as any).role || "",
                createdAt: (review.user as any).createdAt || "",
              }
            : {
                id: "deleted",
                name: "Deleted User",
                email: "",
                role: "",
                createdAt: "",
              },

          product: review.product
            ? {
                id: (review.product as any)._id.toString(),
                name: (review.product as any).name || "Unknown",
                description: (review.product as any).description || "",
                price: (review.product as any).price || 0,
                images: (review.product as any).images || [],
                category: (review.product as any).category || "",
                publicId: (review.product as any).publicId || "",
              }
            : {
                id: "deleted",
                name: "Deleted Product",
                description: "",
                price: 0,
                images: [],
                category: "",
                publicId: "",
              },
        }));
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
    getSellerReviews: async (_: any, __: any, context: any) => {
      const userId = context?.user?.userId;
      if (!context.user) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }
      const seller = await Seller.findOne({ owner: userId });
      if (!seller) throw new Error("Seller not found");
      const products = await Product.find({ seller: seller._id });
      if (!products) throw new Error("No products created yet...");
      const productIds = await products.map((p) => p._id);
      const reviews = await Review.find({
        product: { $in: productIds },
      })
        .populate("user", "name")
        .populate("product");
      return reviews.map((review) => ({
        id: review._id.toString(),
        content: review.content,
        rating: review.rating,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,

        user: review.user
          ? {
              id: (review.user as any)._id.toString(),
              name: (review.user as any).name,
            }
          : null,

        product: review.product
          ? {
              id: (review.product as any)._id.toString(),
              name: (review.product as any).name,
              description: (review.product as any).description,
            }
          : null,
      }));
    },
    getSellerReviewStats: async (_: any, __: any, context: any) => {
      const userId = context?.user?.userId;
      if (!context.user) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }
      const seller = await Seller.findOne({ owner: userId });
      if (!seller) throw new Error("Seller not found");
      const products = await Product.find({ seller: seller._id });
      if (products.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
        };
      }
      const productIds = products.map((p) => p._id);
      const reviews = await Review.find({
        product: { $in: productIds },
      })
        .populate("user", "name")
        .populate("product");
      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
        };
      }
      const totalReviews = reviews.length;
      const sumOfRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      const averageRating = totalReviews > 0 ? sumOfRating / totalReviews : 0;
      return {
        averageRating,
        totalReviews,
      };
    },
    
  },
  Mutation: {
    createReview: async (_: any, { input }: any, context: any) => {
      try {
        const { productId, content, rating } = input;
        const response = await writeReview(
          {
            productId,
            content,
            rating,
          },
          context,
        );
        return {
          message: response.message,
          review: response.review,
        };
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

export default reviewResolver;
