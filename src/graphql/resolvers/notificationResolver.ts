import { GraphQLError } from "graphql";
import notificationModel from "../../model/notificationModel.js";

const notificationResolvers: any = {
  Query: {
    getNotifications: async (_: any, __: any, context: any) => {
      try {
        const userId = context?.user?.userId;
        if (!userId) {
          throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }
        const notifications = await notificationModel
          .find({ user: userId })
          .sort({ createdAt: -1 });
        return notifications;
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    unReadNotificationsCount: async (_: any, __: any, context: any) => {
      try {
        const userId = context?.user?.userId;
        if (!userId) {
          throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }
        const count = await notificationModel.countDocuments({
          user: userId,
          read: false,
        });
        return count;
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
    markAllNotificationsAsRead: async (_: any, __: any, context: any) => {
      try {
        const userId = context?.user?.userId;
        if (!userId) {
          throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }
        const notification = await notificationModel.updateMany(
          { user: userId, read: false },
          { $set: { read: true } },
        );
        return "All notifications marked as read";
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
    markNotificationAsRead: async (
      _: any,
      { notificationId }: { notificationId: string },
      context: any,
    ) => {
      try {
        const userId = context?.user?.userId;
        if(!userId) {
            throw new GraphQLError("Not authenticated", {
                extensions: { code: "UNAUTHENTICATED" },
            });
        }
        const notification = await notificationModel.findOneAndUpdate(
          { _id: notificationId, user: userId },
          { $set: { read: true } },
          { new: true },
        );
        if (!notification) {
          throw new GraphQLError("Notification not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
        return "Notification marked as read";
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

export default notificationResolvers;
