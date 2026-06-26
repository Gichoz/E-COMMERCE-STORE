import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// 1. Fetch overall store metrics
export const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  // Aggregate orders to get total orders count and total revenue
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null, 
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  const { totalSales = 0, totalRevenue = 0 } = salesData[0] || {};

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    revenue: totalRevenue,
  };
};

// 2. Fetch daily chart stats using the custom ranges passed from the router
export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Generate a helper array of dates to ensure empty days still show up as 0 on the chart
    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map((date) => {
      const found = dailySales.find((item) => item._id === date);
      return {
        date,
        sales: found ? found.sales : 0,
        revenue: found ? found.revenue : 0,
      };
    });
  } catch (error) {
    throw error;
  }
};

// Helper function to fill in calendar dates gaps
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}