import { register, login } from "../../services/authservices.js";

const Resolvers = {
  Mutation: {
    register: async (_: any, { input }: any) => {
      try {
        const { name, email, password } = input;
        const response = await register({
          name,
          email,
          password,
        });
        return response;
      } catch (error: any) {
        throw new Error(error.message || "Server error");
      }
    },
    login: async (_: any, { input }: any, context: any) => {
      try {
        const { email, password } = input;
        const response = await login({
          email,
          password,
        });
        console.log("Login Response:", response);
        console.log("Context User:", context.user);
        return response;
      } catch (error: any) {
        throw new Error(error.message || "Server error");
      }
    },
    
  },
};
export default Resolvers;
