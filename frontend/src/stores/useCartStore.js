import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const useCartStore = create((set, get) => ({
	cart: [],
	coupon: null,
	total: 0,
	subtotal: 0,
	isCouponApplied: false,

	getCartItems: async () => {
		try {
			const res = await axios.get("/cart");
			set({ cart: Array.isArray(res.data) ? res.data : [] });
			get().calculateTotals();
		} catch (error) {
			console.error("Error fetching cart items:", error);
			toast.error(error.response?.data?.message || "Failed to load cart");
		}
	},

	addToCart: async (product) => {
		try {
			const res = await axios.post("/cart", { productId: product._id });
			toast.success("Product added to cart");

			// Set cart state with fully populated server response
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},

	removeFromCart: async (productId) => {
		try {
			const res = await axios.delete(`/cart`, { data: { productId } });
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},

	updateQuantity: async (productId, quantity) => {
		if (quantity === 0) {
			get().removeFromCart(productId);
			return;
		}
		try {
			const res = await axios.put(`/cart/${productId}`, { quantity });
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},

	calculateTotals: () => {
		const { cart, coupon } = get();
		const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
		let total = subtotal;

		if (coupon) {
			const discount = subtotal * (coupon.discountPercentage / 100);
			total = subtotal - discount;
		}
		set({ subtotal, total });
	},

	getMyCoupon: async () => {
		try {
			const res = await axios.get("/coupons");
			set({ coupon: res.data });
		} catch (error) {
			console.error("Error fetching coupon:", error);
		}
	},

	applyCoupon: async (code) => {
		try {
			const res = await axios.post("/coupons/validate", { code });
			set({ coupon: res.data, isCouponApplied: true });
			get().calculateTotals();
			toast.success("Coupon applied successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to apply coupon");
		}
	},

	removeCoupon: () => {
		set({ coupon: null, isCouponApplied: false });
		get().calculateTotals();
		toast.success("Coupon removed");
	},

	clearCart: () => {
		set({ cart: [], coupon: null, isCouponApplied: false, total: 0, subtotal: 0 });
	},

	handleCheckout: async () => {
		try {
			const res = await axios.post("/payments/create-checkout-session", {
				products: get().cart,
				couponCode: get().coupon ? get().coupon.code : null,
			});

			const session = res.data;

			if (session.url) {
				window.location.assign(session.url);
			} else {
				toast.error("Failed to retrieve a valid checkout URL from the server.");
			}
		} catch (error) {
			console.error("Checkout error:", error);
			toast.error(error.response?.data?.message || "An error occurred during checkout");
		}
	},
}));