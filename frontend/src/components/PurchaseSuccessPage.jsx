import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, HandHeart } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const { clearCartOnSuccess } = useCartStore();

  useEffect(() => {
    const handleSuccess = async () => {
      const sessionId = new URLSearchParams(window.location.search).get("session_id");
      if (sessionId) {
        await clearCartOnSuccess(sessionId);
      }
      setIsProcessing(false);
    };

    handleSuccess();
  }, [clearCartOnSuccess]);

  if (isProcessing) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Processing your order...
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        numberOfPieces={150}
        recycle={false}
      />

      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 text-center border border-gray-700">
        <CheckCircle className="text-emerald-400 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h1>
        <p className="text-gray-300 text-sm mb-6">
          Thank you for your order. We've cleared your cart and are processing your items.
        </p>

        <div className="bg-gray-700/50 rounded-lg p-4 mb-6 flex items-center gap-3 text-left">
          <HandHeart className="text-emerald-400 w-8 h-8 flex-shrink-0" />
          <p className="text-xs text-gray-300">
            A confirmation email will be sent shortly with your shipping details.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition duration-200"
        >
          Continue Shopping <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;