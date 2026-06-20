import { GraphQLError } from "graphql";
import { addToCart, handleDelete } from "../../services/cartService.js";
import { createUserOrder } from "../../services/orderService.js";
import { createCoupon } from "../../services/createCouponCode.js";
import { initializeTransaction } from "../../services/iniatializeTransactionPaystack.js";
import CouponModel from "../../model/couponModel.js";
import orderModel from "../../model/orderModel.js";
import Cart from "../../model/cartModel.js";
import { verifyTransaction } from "../../services/verifyTransaction.js";
const cartResolver = {
  Query: {
    getCoupons: async (_: any, __: any, context: any) => {
      try {
        if (!context.user) {
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        const userRole = context?.user?.role;
        if (userRole !== "admin") {
          throw new GraphQLError("Forbidden", {
            extensions: { code: "FORBIDDEN" },
          });
        }
        const coupons = await CouponModel.find();

        return coupons.map((coupon) => ({
          id: coupon._id?.toString(),
          couponCode: coupon.couponCode,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          expiryDate: coupon.expiryDate,
          isActive: coupon.isActive,
          couponDescription: coupon.couponDescription,
        }));
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    getCart: async (_: any, __: any, context: any) => {
      try {
        const userId = context?.user?.userId;

        if (!context.user) {
          throw new GraphQLError("Unauthorized", {
            extensions: {
              code: "UNAUTHENTICATED",
            },
          });
        }

        const cart = await Cart.findOne({ user: userId }).populate(
          "items.product",
        );

        if (!cart) throw new Error("Cart Not Found");

        return {
          id: cart._id.toString(),
          user: cart.user.toString(),
          items: cart.items.map((item: any) => ({
            product: {
              id: item.product._id?.toString(),
              name: item.product.name,
              description: item.product.description,
              images: item.product.images,
              price: item.product.price,
            },
            quantity: item.quantity,
            priceAtAdd: item.priceAtAdd,
          })),
          totalPrice: cart.totalPrice,
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    getOrders: async (_: any, __: any, context: any) => {
      try {
        if (!context.user) {
          throw new GraphQLError("Unauthorized", {
            extensions: {
              code: "UNAUTHENTICATED",
            },
          });
        }
        const userId = context?.user?.userId;
        const orders = await orderModel
          .find({ user: userId })
          .populate("items.product");
        if (orders.length === 0) {
          throw new Error("No orders found");
        }
        return orders.map((order) => ({
          user: order.user.toString(),
          items: order.items.map((item: any) => ({
           product: {
              id: item.product._id?.toString(),
              name: item.product.name,
              description: item.product.description,
              images: item.product.images,
              price: item.product.price,
            },
            quantity: item.quantity,
            priceAtAdd: item.priceAtAdd,
          })),
          total: order.total,
          subtotal: order.subtotal,
          status: order.status,
        }));
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
  },

  Mutation: {
    addOrUpdateCartItem: async (_: any, { input }: any, context: any) => {
      try {
        const { productId, quantity } = input;
        const response = await addToCart(
          {
            productId,
            quantity,
          },
          context,
        );
        return {
          message: response.message,
          cart: response.cart,
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    deleteCartItem: async (_: any, { input }: any, context: any) => {
      try {
        const { productId, deleteAll } = input;
        const response = await handleDelete(
          {
            productId,
            deleteAll,
          },
          context,
        );
        return {
          message: response.message,
          cart: response.cart,
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
    createCoupon: async (_: any, { input }: any, context: any) => {
      try {
        const {
          couponCode,
          expiryDate,
          couponDescription,
          discountType,
          discountValue,
          isActive,
          maxUses,
        } = input;
        const response = await createCoupon(
          {
            couponCode,
            expiryDate,
            couponDescription,
            discountType,
            discountValue,
            isActive,
            maxUses,
          },
          context,
        );
        return {
          message: response.message,
          couponCode: response.couponCode,
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    createOrder: async (_: any, { input }: any, context: any) => {
      try {
        const { couponCode, paymentMethod } = input;
        const response = await createUserOrder(
          {
            couponCode,
            paymentMethod,
          },
          context,
        );
        return {
          message: response.message,
          order: response.order,
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    initializePayment: async (_: any, { input }: any, context: any) => {
      try {
        const { orderID } = input;

        const response = await initializeTransaction({ orderID }, context);

        return {
          authorization_url: response.authorization_url,
          reference: response.reference,
          message: response.message,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to initialize payment");
      }
    },

    verifyPayment: async (_: any, { input }: any) => {
      try {
        const { reference } = input;
        const response = await verifyTransaction({ reference });
        return {
          message: response.message,
          status: response.status,
          reference: response.reference,
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

export default cartResolver;
