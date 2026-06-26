import { useCartStore } from "../stores/useCartStore";
import { useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";

const CartPage = () => {
  const { cart, getCartItems, total, subtotal, coupon, isCouponApplied } = useCartStore();

  useEffect(() => {
    getCartItems();
  }, [getCartItems]);

  const savings = subtotal - total;

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="mx-auto max-w-7xl px-4 2xl:px-0">
        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          
          {/* Cart items */}
          <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
            {cart.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
            )}

            {savings > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-900/50 px-6 py-4">
                <span className="text-base font-medium text-emerald-400">
                  You are saving{" "}
                  <span className="font-bold">${savings.toFixed(2)}</span> with
                  this purchase
                </span>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
            <OrderSummary />
            <GiftCouponCard />
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center space-y-4 py-16">
    <ShoppingCart className="h-24 w-24 text-gray-300" />
    <h3 className="text-2xl font-semibold text-gray-400">Your cart is empty</h3>
    <p className="text-gray-400">
      Looks like you haven&apos;t added anything to your cart yet.
    </p>
    <Link
      to="/"
      className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 text-white transition hover:bg-emerald-700"
    >
      Start Shopping
    </Link>
  </div>
);

export default CartPage;