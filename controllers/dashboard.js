const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const mongoose = require('mongoose');

const getDashboardData = async (req, res) => {
  try {
    // ------------------ Stats ------------------
    const totalRevenueAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$priceSummary.grandTotal' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
    const totalOrders = totalRevenueAgg[0]?.totalOrders || 0;
    const productsDelivered = await Product.countDocuments({ isActivate: true });

    const statsData = [
      {
        type: 'revenue',
        label: 'Total Revenue',
        value: `Rs. ${totalRevenue.toLocaleString()}`,
        subtext: '+12% from last month',
      },
      {
        type: 'products',
        label: 'Products Delivered',
        value: productsDelivered.toString(),
        subtext: 'This month',
      },
      {
        type: 'orders',
        label: 'Total Orders',
        value: totalOrders.toString(),
        subtext: '+8% from last month',
      },
    ];

    // ------------------ Order History ------------------
    const orderHistoryAgg = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$orderedAt' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const orderHistoryData = months.map((m, i) => {
      const monthData = orderHistoryAgg.find(o => o._id === i + 1);
      return { month: m, orders: monthData ? monthData.orders : 0 };
    });

    // ------------------ Sales by Category ------------------
    const salesByCategoryAgg = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.name',
          foreignField: 'title',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          value: { $sum: '$orderItems.price' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.title',
          value: 1,
        },
      },
    ]);

    // ------------------ Revenue by Month ------------------
    const revenueByMonthAgg = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$orderedAt' },
          revenue: { $sum: '$priceSummary.grandTotal' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const revenueByMonthData = months.map((m, i) => {
      const monthData = revenueByMonthAgg.find(r => r._id === i + 1);
      return { month: m, revenue: monthData ? monthData.revenue : 0 };
    });

    // ------------------ Final Response ------------------
    res.json({
      stats: statsData,
      orderHistory: orderHistoryData,
      salesByCategory: salesByCategoryAgg,
      revenueByMonth: revenueByMonthData,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardData };
