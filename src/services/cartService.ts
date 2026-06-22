import Cart from "../model/cartModel.js";
import productModel from "../model/productModel.js";

interface AddToCartInput {
  productId: string;
  quantity: number;
}

interface DeleteCart {
  productId: string;
  deleteAll?: boolean;
}

export async function addToCart(data: AddToCartInput, context: any) {
  const { quantity, productId } = data;

  if (!productId) throw new Error("Product ID is required");
  if (!quantity || quantity <= 0)
    throw new Error("Quantity must be greater than 0");

  const userId = context?.user?.userId;
  if (!userId) throw new Error("Not authenticated");

  const product = await productModel.findById(productId);
  if (!product) throw new Error("Product not found");

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [
        {
          product: product._id,
          quantity,
          priceAtAdd: product.price,
        },
      ],
      totalPrice: product.price * quantity,
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        priceAtAdd: product.price,
      });
    }

    cart.totalPrice = cart.items.reduce((sum, item) => {
      return sum + item.priceAtAdd * item.quantity;
    }, 0);

    await cart.save();
  }
  const populatedCart = await cart.populate("items.product");

  const cleanCart = {
    ...populatedCart.toObject(),
    items: populatedCart.items.map((item: any) => ({
      ...(item.toObject?.() || item),
      product: item.product
        ? {
            ...(item.product.toObject?.() || item.product),
            id: item.product._id.toString(),
          }
        : null,
    })),
  };

  return {
    message: "Added to cart successfully",
    cart: cleanCart,
  };
}

export async function handleDelete(data: DeleteCart, context: any) {
  const { productId, deleteAll = false } = data;
  if (!productId) throw new Error("productID is required");
  const userId = context?.user?.userId;
  if (!userId) throw new Error("Not authenticated");

  let cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );
  if (itemIndex === -1) throw new Error("Item not found in cart");
  const item = cart.items[itemIndex];
  if (!item) throw new Error("no item found");
  if (deleteAll || item?.quantity <= 1) {
    cart.items.splice(itemIndex, 1);
  } else {
    item.quantity -= 1;
  }

  cart.totalPrice = cart.items.reduce((sum, item) => {
    return sum + item.quantity * item.priceAtAdd;
  }, 0);
  await cart.save();

  const populatedCart = await cart.populate("items.product");

  const cleanCart = {
    ...populatedCart.toObject(),
    items: populatedCart.items.map((item: any) => ({
      ...item.toObject?.(),
      product: item.product
        ? {
            ...item.product.toObject?.(),
            id: item.product._id.toString(),
          }
        : null,
    })),
  };
  return {
    message: "Cart Updated successfully",
    cart: cleanCart
  };
}
