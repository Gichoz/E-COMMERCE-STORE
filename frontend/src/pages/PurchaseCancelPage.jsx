import { XCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PurchaseCancelPage = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 shadow-xl border border-gray-700 text-center">
        <XCircle className="text-red-500 h-16 w-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-red-400 mb-2">Order Cancelled</h1>
        <p className="text-gray-300 mb-6">Your checkout session was abandoned. No charges were processed.</p>
        
        <Link to="/cart" className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 px-4 rounded-md transition duration-300">
          <ArrowLeft className="mr-2 h-5 w-5" /> Return to Cart
        </Link>
      </div>
    </div>
  );
};

export default PurchaseCancelPage;