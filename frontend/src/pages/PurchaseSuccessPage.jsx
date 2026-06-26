import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";

const PurchaseSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clearCart = useCartStore((state) => state.clearCart); // Grab clear action if available
  const effectRan = useRef(false);

  useEffect(() => {
    if (!sessionId || effectRan.current) return;
    
    const confirmPayment = async () => {
      try {
        effectRan.current = true;
        setLoading(true);
        await axios.post("/payments/checkout-success", { sessionId });
        if (typeof clearCart === "function") clearCart(); // Clean cart state upon confirmation
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
        setLoading(false);
      }
    };

    confirmPayment();
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
        <h2 className="text-xl font-semibold tracking-wide">Verifying transaction details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-red-500 px-4">
        <div className="bg-red-950/50 p-6 rounded-xl border border-red-900 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Fulfillment Stalled</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 font-medium px-5 py-2.5 rounded-lg transition">
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 text-center shadow-xl transform transition-all duration-500 scale-100">
        
        {/* Animated Green Checkmark Icon Block */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400 animate-bounce">
            <CheckCircle className="w-16 h-16" strokeWidth={1.5} />
          </div>
        </div>

        {/* Dynamic Success Headlines */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Purchase Successful!
        </h1>
        <p className="text-emerald-400 font-medium text-sm mb-4">
          Thank you for your order 🎉
        </p>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Your payment has been completely verified and processed. We've updated your analytics metrics data and initiated your packaging fulfillment pipeline.
        </p>

        {/* Call to Action Navigation Layout Links */}
        <div className="space-y-3">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
          
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-medium py-3 px-4 rounded-xl border border-gray-600/30 transition-all duration-200"
          >
            Go to Admin Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;