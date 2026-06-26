import { useEffect, useState } from "react";
import { Users, Package, ShoppingCart, DollarSign, Loader } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "../lib/axios";

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dailyAnalyticsData, setDailyAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("/analytics");
        setAnalyticsData(res.data.analyticsData);
        // This maps perfectly to the detailed custom payload key from your router!
        setDailyAnalyticsData(res.data.dailySalesData); 
      } catch (err) {
        console.error("Error loading admin metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-emerald-500 h-12 w-12" />
      </div>
    );
  }

  const cardData = [
    { title: "Total Users", value: analyticsData?.users || 0, icon: Users, color: "from-blue-500 to-cyan-500" },
    { title: "Total Products", value: analyticsData?.products || 0, icon: Package, color: "from-emerald-500 to-teal-500" },
    { title: "Total Sales", value: analyticsData?.totalSales || 0, icon: ShoppingCart, color: "from-amber-500 to-orange-500" },
    { title: "Total Revenue", value: `$${(analyticsData?.revenue || 0).toFixed(2)}`, icon: DollarSign, color: "from-fuchsia-500 to-pink-500" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-lg bg-linear-to-br ${card.color} text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Visual Layout */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-200 mb-6">Sales & Revenue Metrics</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis yAxisId="left" stroke="#9CA3AF" />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151", color: "#FFF" }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#10B981" activeDot={{ r: 8 }} name="Sales Count" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue ($)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;