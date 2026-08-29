import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";

// Safe helper to convert Redis cart items into full Mongo product objects
const populateCartProducts = async (cartItems) => {
	try {
		if (!Array.isArray(cartItems) || cartItems.length === 0) return [];

		// Extract IDs safely regardless of whether Redis stored strings or objects
		const rawIds = cartItems.map((item) => {
			if (typeof item === "string") return item;
			return item?.product || item?.id || null;
		}).filter(Boolean);

		if (rawIds.length === 0) return [];

		// Query MongoDB for matching products
		const products = await Product.find({ _id: { $in: rawIds } });

		return products.map((product) => {
			const item = cartItems.find((cartItem) => {
				const id = typeof cartItem === "string" ? cartItem : cartItem?.product || cartItem?.id;
				return id && id.toString() === product._id.toString();
			});

			return {
				...product.toJSON(),
				quantity: item && typeof item === "object" && item.quantity ? item.quantity : 1,
			};
		});
	} catch (err) {
		console.error("Error populating cart products:", err.message);
		return [];
	}
};

export const getCartProducts = async (req, res) => {
	try {
		let cartItems = await redis.get(`cart:${req.user._id}`);
		if (!cartItems) return res.json([]);

		let parsedItems = [];
		try {
			parsedItems = typeof cartItems === "string" ? JSON.parse(cartItems) : cartItems;
		} catch (parseError) {
			console.warn("Corrupted JSON in Redis, resetting cart cache...");
			await redis.del(`cart:${req.user._id}`);
			return res.json([]);
		}

		const cartProducts = await populateCartProducts(parsedItems);
		return res.json(cartProducts);
	} catch (error) {
		console.error("Error in getCartProducts controller:", error.message);
		return res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const userId = req.user._id.toString();

		let cartItems = await redis.get(`cart:${userId}`);
		
		let parsedItems = [];
		if (cartItems) {
			try {
				parsedItems = typeof cartItems === "string" ? JSON.parse(cartItems) : cartItems;
			} catch (e) {
				parsedItems = [];
			}
		}

		const existingItem = parsedItems.find((item) => {
			const id = typeof item === "string" ? item : item?.product;
			return id === productId;
		});

		if (existingItem) {
			if (typeof existingItem === "object") {
				existingItem.quantity = (existingItem.quantity || 1) + 1;
			}
		} else {
			parsedItems.push({ product: productId, quantity: 1 });
		}

		await redis.set(`cart:${userId}`, JSON.stringify(parsedItems));

		const cartProducts = await populateCartProducts(parsedItems);
		return res.json(cartProducts);
	} catch (error) {
		console.error("Error in addToCart controller:", error.message);
		return res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const userId = req.user._id.toString();

		let cartItems = await redis.get(`cart:${userId}`);
		if (!cartItems) return res.json([]);

		let parsedItems = typeof cartItems === "string" ? JSON.parse(cartItems) : cartItems;
		
		parsedItems = parsedItems.filter((item) => {
			const id = typeof item === "string" ? item : item?.product;
			return id !== productId;
		});

		if (parsedItems.length === 0) {
			await redis.del(`cart:${userId}`);
		} else {
			await redis.set(`cart:${userId}`, JSON.stringify(parsedItems));
		}

		const cartProducts = await populateCartProducts(parsedItems);
		return res.json(cartProducts);
	} catch (error) {
		console.error("Error in removeAllFromCart controller:", error.message);
		return res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const { quantity } = req.body;
		const userId = req.user._id.toString();

		let cartItems = await redis.get(`cart:${userId}`);
		if (!cartItems) return res.status(404).json({ message: "Cart not found" });

		let parsedItems = typeof cartItems === "string" ? JSON.parse(cartItems) : cartItems;
		const existingItem = parsedItems.find((item) => {
			const id = typeof item === "string" ? item : item?.product;
			return id === productId;
		});

		if (existingItem) {
			if (quantity === 0) {
				parsedItems = parsedItems.filter((item) => {
					const id = typeof item === "string" ? item : item?.product;
					return id !== productId;
				});
			} else {
				if (typeof existingItem === "object") existingItem.quantity = quantity;
			}

			if (parsedItems.length === 0) {
				await redis.del(`cart:${userId}`);
			} else {
				await redis.set(`cart:${userId}`, JSON.stringify(parsedItems));
			}

			const cartProducts = await populateCartProducts(parsedItems);
			return res.json(cartProducts);
		}

		return res.status(404).json({ message: "Product not found in cart" });
	} catch (error) {
		console.error("Error in updateQuantity controller:", error.message);
		return res.status(500).json({ message: "Server error", error: error.message });
	}
};