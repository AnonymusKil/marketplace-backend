import { GraphQLError } from "graphql";
import { createProduct } from "../../services/productService.js";
import sellerModel from "../../model/sellerModel.js";
import productModel from "../../model/productModel.js";
import { generateProductDescriptionWithAi } from "../../services/geminiService.js";
const productResolver = {
  Query: {
    products: async (_: any, { search }: any) => {
      try {
        const filter: any = {};

        if (search) {
          filter.name = { $regex: search, $options: "i" };
        }

        const products = await productModel.find(filter).populate("seller");
        return products.map((product) => {
          const productObj = product.toObject();
          const sellerObj = productObj.seller as any;
          return {
            id: productObj._id.toString(),
            name: productObj.name,
            description: productObj.description,
            price: productObj.price,
            category: productObj.category,
            images: productObj.images,
            publicId: productObj.publicId,
            createdAt: productObj.createdAt,
            seller: {
              id: sellerObj._id.toString(),
              storeName: sellerObj.storeName,
              description: sellerObj.description,
              owner: sellerObj.owner,
              businessEmail: sellerObj.businessEmail,
              businessPhone: sellerObj.businessPhone,
              businessLogo: sellerObj.businessLogo,
            },
          };
        });
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    getProductsByProductId: async (_: any, { productId }: any) => {
      try {
        const product = await productModel
          .findById(productId)
          .populate("seller");
        console.log("Product ID:", productId);
        if (!product) {
          throw new GraphQLError("Product not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
        const productObj = product.toObject();
        const sellerObj = productObj.seller as any;

        return {
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          images: product.images,
          publicId: product.publicId,
          seller: {
            id: sellerObj._id.toString(),
            storeName: sellerObj.storeName,
            description: sellerObj.description,
            owner: sellerObj.owner,
            businessEmail: sellerObj.businessEmail,
            businessPhone: sellerObj.businessPhone,
            businessLogo: sellerObj.businessLogo,
            businessAddress: sellerObj.businessAddress,
            publicId: sellerObj.publicId,
          },
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    mysellerProducts: async (_: any, __: any, context: any) => {
      try {
        const userId = context?.user?.userId;
        const userRole = context?.user?.role;
        if (!userId || userRole !== "seller") {
          throw new GraphQLError("Not authorized", {
            extensions: { code: "FORBIDDEN" },
          });
        }
        const seller = await sellerModel.findOne({ owner: userId });
        if (!seller) {
          throw new GraphQLError("Seller profile not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
        const products = await productModel
          .find({ seller: seller._id })
          .populate("seller");
        return products.map((product) => {
          const productObj = product.toObject();
          const sellerObj = productObj.seller as any;
          return {
            id: productObj._id.toString(),
            name: productObj.name,
            description: productObj.description,
            price: productObj.price,
            category: productObj.category,
            images: productObj.images,
            publicId: productObj.publicId,

            seller: sellerObj
              ? {
                  id: sellerObj._id.toString(),
                  storeName: sellerObj.storeName,
                  description: sellerObj.description,
                  owner: sellerObj.owner,
                  businessEmail: sellerObj.businessEmail,
                  businessPhone: sellerObj.businessPhone,
                  businessLogo: sellerObj.businessLogo,
                  businessAddress: sellerObj.businessAddress,
                  publicId: sellerObj.publicId,
                }
              : null,
          };
        });
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
    createProduct: async (_: any, { input }: any, context: any) => {
      try {
        const { name, description, price, category, images, publicId } = input;
        const response = await createProduct(
          {
            name,
            description,
            price,
            category,
            images,
            publicId,
          },
          context,
        );
        return {
          message: response.message,
          product: response.product,
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Server error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },
    generateProductDescription: (_:any, { name }: {name:any}) => {
      return generateProductDescriptionWithAi(name);
    },
  },
};

export default productResolver;
