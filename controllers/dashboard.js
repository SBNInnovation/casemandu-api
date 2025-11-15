const Brand = require("../models/brandModel");
const Customize = require("../models/customizeModel");
const Order = require("../models/orderModel");
const PhoneModel = require("../models/phoneModel");
const Product = require("../models/productModel");

const getDashboardData = async (req, res) => {
    try {

        // Aggregation for total sales
        const totalSalesAgg = await Order.aggregate([
            { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }
        ]);
        const totalSales = totalSalesAgg.length > 0 ? totalSalesAgg[0].totalSales : 0;

        // Parallel counts
        const [
            totalProducts,
            totalOrders,
            totalBrands,
            totalPhoneModels,
            totalCustomModels
        ] = await Promise.all([
            Product.countDocuments({}),
            Order.countDocuments({}),
            Brand.countDocuments({}),
            PhoneModel.countDocuments({}),
            Customize.countDocuments({})
        ]);

        res.status(200).json({
            success: true,
            message: "Dashboard data",
            data: {
                totalProducts,
                totalOrders,
                totalBrands,
                totalPhoneModels,
                totalCustomModels,
                totalSales
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error"
        });
    }
};

module.exports = { getDashboardData };
