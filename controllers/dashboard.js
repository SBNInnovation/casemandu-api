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
    const productsDelivered = await Order.countDocuments({});

    const statsData = [
      {
        type: 'revenue',
        label: 'Total Revenue',
        value: `Rs. ${totalRevenue.toLocaleString()}`,
        // subtext: '+12% from last month',
      },
      {
        type: 'products',
        label: 'Products Delivered',
        value: productsDelivered.toString(),
        // subtext: 'This month',
      },
      {
        type: 'orders',
        label: 'Total Orders',
        value: totalOrders.toString(),
        // subtext: '+8% from last month',
      },
    ];

    // ------------------ Order History By Year ------------------
    const orderHistoryAgg = await Order.aggregate([
      {
        $group: {
          _id: { year: { $year: '$orderedAt' }, month: { $month: '$orderedAt' } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Transform aggregation to { year: [{month, orders}] }
    const orderHistoryDataByYear = {};
    orderHistoryAgg.forEach(item => {
      const year = item._id.year;
      const monthIndex = item._id.month - 1;
      if (!orderHistoryDataByYear[year]) orderHistoryDataByYear[year] = months.map(m => ({ month: m, orders: 0 }));
      orderHistoryDataByYear[year][monthIndex].orders = item.orders;
    });

    // ------------------ Revenue By Year ------------------
    const revenueAgg = await Order.aggregate([
      {
        $group: {
          _id: { year: { $year: '$orderedAt' }, month: { $month: '$orderedAt' } },
          revenue: { $sum: '$priceSummary.grandTotal' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const revenueByMonthDataByYear = {};
    revenueAgg.forEach(item => {
      const year = item._id.year;
      const monthIndex = item._id.month - 1;
      if (!revenueByMonthDataByYear[year]) revenueByMonthDataByYear[year] = months.map(m => ({ month: m, revenue: 0 }));
      revenueByMonthDataByYear[year][monthIndex].revenue = item.revenue;
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

    const salesByOptionAgg = await Order.aggregate([
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
        _id: '$product.option', // Group by option
        value: { $sum: '$orderItems.price' },
        },
    },
    {
        $lookup: {
        from: 'options',          // Join with Option collection
        localField: '_id',
        foreignField: '_id',
        as: 'option',
        },
    },
    { $unwind: '$option' },
    {
        $project: {
        name: '$option.title',   // Option title as name
        value: 1,
        },
    },
    ]);


    // ------------------ Final Response ------------------
    res.json({
      stats: statsData,
      orderHistory: orderHistoryDataByYear,
      revenueByMonth: revenueByMonthDataByYear,
      salesByCategory: salesByCategoryAgg,
      salesByOption: salesByOptionAgg
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardData };
