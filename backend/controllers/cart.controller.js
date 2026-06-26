import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";

export const getCartProducts = async (req, res) => {
  try {
    const cartItems = await redis.get(`cart:${req.user._id}`);
    if (!cartItems) {
      return res.json([]);
    }

    const parsedItems = JSON.parse(cartItems);

    // Get product details for each cart item
    const products = await Product.find({
      _id: { $in: parsedItems.map((item) => item.product) },
    });

    // Add quantity to each product
    const cartProducts = products.map((product) => {
      const item = parsedItems.find(
        (cartItem) => cartItem.product === product._id.toString()
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.json(cartProducts);
  } catch (error) {
    console.log("Error in getCartProducts controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id.toString();

    // Get current cart or empty array
    let cartItems = await redis.get(`cart:${userId}`);
    cartItems = cartItems ? JSON.parse(cartItems) : [];

    // Check if product already in cart
    const existingItem = cartItems.find((item) => item.product === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({ product: productId, quantity: 1 });
    }

    // Save back to Redis
    await redis.set(`cart:${userId}`, JSON.stringify(cartItems));

    res.json(cartItems);
  } catch (error) {
    console.log("Error in addToCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id.toString();

    let cartItems = await redis.get(`cart:${userId}`);
    if (!cartItems) {
      return res.json([]);
    }

    cartItems = JSON.parse(cartItems);

    // Filter out the product
    cartItems = cartItems.filter((item) => item.product !== productId);

    if (cartItems.length === 0) {
      await redis.del(`cart:${userId}`);
    } else {
      await redis.set(`cart:${userId}`, JSON.stringify(cartItems));
    }

    res.json(cartItems);
  } catch (error) {
    console.log("Error in removeAllFromCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id.toString();

    let cartItems = await redis.get(`cart:${userId}`);
    if (!cartItems) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cartItems = JSON.parse(cartItems);
    const existingItem = cartItems.find((item) => item.product === productId);

    if (existingItem) {
      if (quantity === 0) {
        cartItems = cartItems.filter((item) => item.product !== productId);
      } else {
        existingItem.quantity = quantity;
      }

      if (cartItems.length === 0) {
        await redis.del(`cart:${userId}`);
      } else {
        await redis.set(`cart:${userId}`, JSON.stringify(cartItems));
      }

      res.json(cartItems);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};