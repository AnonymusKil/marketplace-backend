import { GraphQLError } from "graphql";
import { addToCart, handleDelete } from "../../services/cartService.js";
import { createUserOrder } from "../../services/orderService.js";
import { createCoupon } from "../../services/createCouponCode.js";
import { initializeTransaction } from "../../services/iniatializeTransactionPaystack.js";
import CouponModel from "../../model/couponModel.js";
import orderModel from "../../model/orderModel.js";
import Cart from "../../model/cartModel.js";
import { verifyTransaction } from "../../services/verifyTransaction.js";
import Seller from "../../model/sellerModel.js";
import Product from "../../model/productModel.js";
export const cartResolver = {
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
          expiryDate: coupon.expiryDate.toISOString(),
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
    getBestCoupon: async () => {
      const coupons = await CouponModel.find();

      if (!coupons || coupons.length === 0) {
        throw new Error("No coupons found");
      }

      const validCoupons = coupons.filter((coupon) => {
        return coupon.isActive && new Date(coupon.expiryDate) > new Date();
      });

      if (validCoupons.length === 0) {
        throw new Error("No valid coupons available");
      }

      const bestCoupon = validCoupons.reduce((best, current) => {
        if (!best) return current;

        return current.discountValue > best.discountValue ? current : best;
      }, null as any);

      return {
        couponCode: bestCoupon.couponCode,
        discountValue: bestCoupon.discountValue,
        discountType: bestCoupon.discountType,
      };
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
              category: item.product.category,
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
          id: order._id?.toString(),
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
          shippingAddress: order.shippingAddress
            ? {
                fullName: order.shippingAddress.fullName,
                phoneNumber: order.shippingAddress.phoneNumber,
                street: order.shippingAddress.phoneNumber,
                emailAddress: order.shippingAddress.emailAddress,
                address: order.shippingAddress.address,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                country: order.shippingAddress.country,
                postalCode: order.shippingAddress.zipCode,
              }
            : null,

          total: order.total,
          subtotal: order.subtotal,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt?.toISOString(),
          updatedAt: order.updatedAt,
          couponCode: order.couponCode,
        }));
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
    getSellerOrders: async (_: any, __: any, context: any): Promise<any> => {
      try {
        if (!context.user) {
          throw new GraphQLError("Unauthorized");
        }

        if (context.user.role !== "seller") {
          throw new GraphQLError("Forbidden");
        }

        const seller = await Seller.findOne({ owner: context.user.userId });
        if (!seller) throw new Error("No seller profile ");
        const sellerProductIds = (
          await Product.find({ seller: seller._id }).select("_id")
        ).map((p) => p._id.toString());
        const orders = await orderModel
          .find({
            "items.product": { $in: sellerProductIds },
          })
          .populate("items.product")
          .populate("user");
        if (orders.length === 0) throw new Error("No Orders yet");
        const formattedOrders = orders.map((order: any) => ({
          ...order.toObject(),
          id: order?._id!.toString(),
          createdAt: order?.createdAt!.toISOString() || null,
        }));

        return formattedOrders;
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error");
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
        const { couponCode, paymentMethod, shippingAddress } = input;
        const response = await createUserOrder(
          {
            couponCode,
            paymentMethod,
            shippingAddress,
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

    updateOrderStatus: async (
      _: any,
      { orderId, status }: { orderId: string; status: any },
      context: any,
    ): Promise<any> => {
      try {
        if (!context.user) {
          throw new GraphQLError("Unauthorized");
        }

        if (context.user.role !== "seller") {
          throw new GraphQLError("Forbidden");
        }

        const seller = await Seller.findOne({ owner: context.user.userId });
        if (!seller) throw new Error("No seller profile ");

        const order = await orderModel.findById(orderId);

        if (!order) {
          throw new Error("Order not found");
        }

        // 🔐 VERY IMPORTANT: ensure seller owns at least one item in order
        const sellerProductIds = (
          await Product.find({ seller: seller._id }).select("_id")
        ).map((p) => p._id.toString());

        const canUpdate = order.items.some((item) =>
          sellerProductIds.includes(item.product.toString()),
        );

        if (!canUpdate) {
          throw new Error("You cannot modify this order");
        }
        if (order.paymentStatus !== "paid") {
          throw new Error("Order has not been paid for");
        }
        const allowedStatuses = [
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
          throw new Error("Invalid order status");
        }
        const flow = {
          processing: ["shipped"],
          shipped: ["delivered"],
          delivered: [] as string [],
          cancelled: [] as string [],
        };

        if (!flow[order.orderStatus].includes(status)) {
          throw new Error("Invalid status transition");
        }

        order.orderStatus = status; // "PROCESSING" | "SHIPPED" | "DELIVERED"
        await order.save();
        return { ...order.toObject(), id: order?._id!.toString() };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error");
      }
    },
  },
};
