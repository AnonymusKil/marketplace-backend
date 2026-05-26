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

    app.use(express.json());
    app.use(cors({
      origin: "https://marketplace-frontend-one-sage.vercel.app/"
    }))

    // ✅ REST routes
    app.use("/image", imageRoutes);

    // ✅ GraphQL
    app.use(
      "/graphql",
      // @ts-ignore
      expressMiddleware(server, {
        context: async ({ req } : {req: any}) => {
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
            return { user: null };
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