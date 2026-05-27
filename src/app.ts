import "dotenv/config";
import express from "express";
import cors from "cors";
import jsonwebtoken from "jsonwebtoken";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { authTypeDefs } from "./graphql/schema/AuthSchma.js";
import authResolvers from "./graphql/resolvers/AuthResolvers.js";
import sellerResolvers from "./graphql/resolvers/sellerResolvers.js";
import approveSellerResolver from "./graphql/resolvers/approveSellerResolver.js";
import imageRoutes from "./routes/uploadImage.js";
import connectDB from "./database/db.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

async function startServer() {
  try {
    await connectDB();
    const resolvers = {
        Query: {
          ...authResolvers.Query,
          // Example query resolver
        },
        Mutation: {
          ...authResolvers.Mutation,
          ...sellerResolvers.Mutation,
          ...approveSellerResolver.Mutation,
          // Example mutation resolver
        }
      };

    const server = new ApolloServer({
      
      typeDefs: authTypeDefs,
      resolvers,
    });
    

    await server.start();
    const allowedOrigins = [
      "https://marketplace-frontend-one-sage.vercel.app",
      "http://localhost:3000",
    ];
    app.use(express.json());
    app.use(cors({
      origin: allowedOrigins,
    }))

    // ✅ REST routes
    app.use("/image", imageRoutes);

    // ✅ GraphQL
    app.use(
      "/graphql",
      // @ts-ignore
      expressMiddleware(server, {
        context: async ({ req, res } : {req: any, res: any}) => {
          const authHeader = req.headers.authorization;
          const token = authHeader?.split(" ")[1];

          if (!token) return { user: null };

          try {
            const decoded = jsonwebtoken.verify(
              token,
              process.env.JWT_SECRET_KEY as string
            );
            return { user: decoded };
          } catch {
            return {req, res, user: null };
          }
        },
      })
    );

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();