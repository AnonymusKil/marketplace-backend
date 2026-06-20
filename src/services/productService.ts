import productModel from "../model/productModel.js";
import Usermodel from "../model/Usermodel.js";
import sellermodel from "../model/sellerModel.js"
import {generateProductDescriptionWithAi} from "./geminiService.js"
interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: "Electronics" | "Clothing" | "Home & Kitchen" | "Beauty & Health" | "Toys & Games" | "Sports & Outdoors" | "Books & Media" | "Food & Drink";
  images: string[];
  publicId: string;
}

interface ProductResponse {
  message: string;
  product: any;
}

export async function createProduct(
  data: CreateProductInput,
  context: any,
): Promise<ProductResponse> {
  try {
    const { name, description, price, category, images, publicId } = data;
    //Auth
    const userId = context?.user?.userId;
    const userRole = context?.user?.role;
    if (!userId || userRole !== "seller") {
      throw new Error("Not authorized");
    }
    const user = await Usermodel.findById(userId);
    if (!user || user.role !== "seller" || user.sellerStatus !== "approved") {
      throw new Error("Not authorized");
    }
    //Validate input
    if (!name?.trim()) throw new Error("Product name is required");
    if (!description?.trim()) throw new Error("Description is required");
    if (price == null || price <= 0) throw new Error("Invalid price");
    if (!Array.isArray(images) || images.length === 0 || images.length > 4) {
      throw new Error("Images must be between 1 and 4");
    }
    const seller = await sellermodel.findOne({ owner: userId });
    if (!seller) throw new Error("Seller not found");
    // check if product with same name exists for this seller
    const existingProduct = await productModel.findOne({ name: name.trim(), seller: seller._id });
    if (existingProduct) {
      throw new Error("You already have a product with this name");
    }
    const productdescription = await generateProductDescriptionWithAi(name)


    // Create the product
    const product = await productModel.create({
      name: name.trim(),
      description: productdescription,
      price,
      category,
      images,
      seller: seller._id,
      publicId,
    });

    return {
      message: "Product created successfully",
      product,
    };
  } catch (error: any) {
    throw new Error("Failed to create product: " + error.message);
  }
}
