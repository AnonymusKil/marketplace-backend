import { register, login } from "../../services/authservices.js";
import User from "../../model/Usermodel.js";

const Resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const user = await User.findById(context.user.userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    },
  },
  Mutation: {
    register: async (_: any, { input }: any, { res}: any) => {
      try {
        const { name, email, password } = input;
        const response = await register({
          name,
          email,
          password,
        });
        res.cookie("refreshToken", response.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        console.log("Register Response:", response);
        return {
          message: "User registered successfully",
          user: response.user,
          token: response.token,
        }
      } catch (error: any) {
        throw new Error(error.message || "Server error");
      }
    },
    login: async (_: any, { input }: any, { res}: any) => {
      try {
        const { email, password } = input;
        const response = await login({
          email,
          password,
        });
        res.cookie("refreshToken", response.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        console.log("Login Response:", response);
        return {
          message: "User logged in successfully",
          user: response.user,
          token: response.token,
        }
      } catch (error: any) {
        throw new Error(error.message || "Server error");
      }
    },
  },
};
export default Resolvers;
