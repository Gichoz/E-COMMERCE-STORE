import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";


export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid or empty products array" });
    }

let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // cents
      totalAmount += amount * product.quantity;

      // Ensure the image string is a fully qualified URL before sending to Stripe
      const isValidUrl = product.image && product.image.startsWith("http");

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            // FIX: Uses fallback placeholder if product image isn't a live URL
            images: isValidUrl ? [product.image] : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200"],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
      if (coupon) {
        totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
      }
    }
    console.log("CLIENT_URL =", process.env.CLIENT_URL);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    // Ensure session.url is explicitly passed back to the client side
    res.status(200).json({ 
      id: session.id, 
      totalAmount: totalAmount / 100,
      url: session.url 
    });
  } catch (error) {
    console.log("Error in createCheckoutSession controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Missing sessionId in request body" });
    }

    // 1. Initial lookup check
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Order already processed and saved successfully.",
        orderId: existingOrder._id,
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: session.metadata.couponCode, userId: session.metadata.userId },
          { isActive: false }
        );
      }

      let products = [];
      try {
        products = JSON.parse(session.metadata.products);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid product metadata format" });
      }

      // 2. Safe Database Write with a duplicate key catch block
      try {
        const newOrder = new Order({
          user: session.metadata.userId,
          products: products.map((product) => ({
            product: product.id || product._id,
            quantity: product.quantity,
            price: product.price,
          })),
          totalAmount: session.amount_total / 100,
          stripeSessionId: sessionId,
        });

        await newOrder.save();

        return res.status(200).json({
          success: true,
          message: "Payment successful, order created.",
          orderId: newOrder._id,
        });
      } catch (dbError) {
        // Catch duplicate key error if it slips past the initial findOne check
        if (dbError.code === 11000) {
          const fallbackOrder = await Order.findOne({ stripeSessionId: sessionId });
          return res.status(200).json({
            success: true,
            message: "Order handled safely.",
            orderId: fallbackOrder?._id,
          });
        }
        throw dbError; // Pass down other database errors
      }
    }

    return res.status(400).json({ message: "Session payment status is unpaid." });

  } catch (error) {
    console.log("Error in checkoutSuccess controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId,
  });

  await newCoupon.save();
  return newCoupon;
}