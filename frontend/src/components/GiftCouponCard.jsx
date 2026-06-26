import { useEffect, useState } from "react";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import { Tag, Ticket } from "lucide-react";
import toast from "react-hot-toast";

const GiftCouponCard = () => {
  const [userInputCode, setUserInputCode] = useState("");
  const { coupon, isCouponApplied, applyCoupon, removeCoupon, getMyCoupon } =
    useCartStore();

  useEffect(() => {
    getMyCoupon();
  }, [getMyCoupon]);

  useEffect(() => {
    if (coupon) setUserInputCode(coupon.code);
  }, [coupon]);

  const handleApplyCoupon = () => {
    if (!userInputCode) return;
    applyCoupon(userInputCode);
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setUserInputCode("");
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="voucher"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Do you have a voucher or gift card?
          </label>
          <input
            type="text"
            id="voucher"
            className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Enter code here"
            value={userInputCode}
            onChange={(e) => setUserInputCode(e.target.value)}
            required
          />
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          onClick={handleApplyCoupon}
        >
          <Tag className="h-5 w-5" />
          Apply Code
        </button>
      </div>

      {isCouponApplied && coupon && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-300">Applied Coupon</h3>
          <div className="mt-2 flex items-center justify-between bg-gray-700 p-2 rounded-lg">
            <div>
              <Ticket className="mr-2 inline-flex h-5 w-5 text-emerald-400" />
              <code className="text-sm font-bold text-emerald-400">
                {coupon.code}
              </code>
              <span className="ml-2 text-sm text-gray-300">
                - {coupon.discountPercentage}% off
              </span>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-sm text-red-400 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCouponCard;