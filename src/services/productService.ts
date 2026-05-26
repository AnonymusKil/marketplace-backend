import productModel from "../model/productModel.js";
import Usermodel from "../model/Usermodel.js";
interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: "Fashion" | "Electronics" | "Home" | "Books" | "Toys" | "Sports" | "Beauty";
  stock: number;
  images: string[];
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
    const { name, description, price, category, stock, images } = data;
    //Auth
    const sellerId = context?.user?.userId;
    const userRole = context?.user?.role;
    if (!sellerId || userRole !== "seller") {
      throw new Error("Not authorized");
    }
    const user = await Usermodel.findById(sellerId);
    if (!user || user.role !== "seller" || user.sellerStatus !== "approved") {
      throw new Error("Not authorized");
    }
    //Validate input
    if (!name?.trim()) throw new Error("Product name is required");
    if (!description?.trim()) throw new Error("Description is required");
    if (price == null || price <= 0) throw new Error("Invalid price");
    if (stock == null || stock < 0) throw new Error("Invalid stock");
    if (!Array.isArray(images) || images.length === 0 || images.length > 4) {
      throw new Error("Images must be between 1 and 4");
    }
    // check if product with same name exists for this seller
    const existingProduct = await productModel.findOne({ name: name.trim(), seller: sellerId });
    if (existingProduct) {
      throw new Error("You already have a product with this name");
    }

    // Create the product
    const product = await productModel.create({
      name,
      description,
      price,
      category,
      images,
      seller: sellerId,
    });

    return {
      message: "Product created successfully",
      product,
    };
  } catch (error: any) {
    throw new Error("Failed to create product: " + error.message);
  }
}
