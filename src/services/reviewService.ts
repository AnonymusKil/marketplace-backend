import reviewModel from "../model/reviewModel.js";
import productModel from "../model/productModel.js";
import orderModel from "../model/orderModel.js";
interface WriteReviewInput {
  productId: string;
  content: string;
  rating: number;
}
interface ReviewResponse {
  message: string;
  review: any;
}

export async function writeReview(
  data: WriteReviewInput,
  context: any,
): Promise<ReviewResponse> {
  try {
    const { productId, content, rating } = data;
    if (!content.trim()) {
      throw new Error("Review content cannot be empty.");
    }

    if (rating === undefined || rating === null) {
      throw new Error("Rating is required.");
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5.");
    }
    if (!productId) throw new Error("productID is required");
    const product = await productModel.findById(productId);
    if (!product) throw new Error("Product Not Found");

    const userId = context?.user?.userId;
    if (!userId) throw new Error("Not authenticated");

    const hasPurchased = await orderModel.findOne({
      user: userId,
      "items.product": productId,
      orderStatus: "delivered",
    });

    if (!hasPurchased) {
      throw new Error("You can only review products you have purchased.");
    }

    // check if user has already review the product
    const existingReview = await reviewModel.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      throw new Error("You already reviewed this product.");
    }
    const review = await reviewModel.create({
      content,
      rating,
      user: userId,
      product: product._id,
    });
    return {
      message: "Review submitted successfully",
      review,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
