const express = require("express");
const { getDashboardData } = require("../controllers/dashboard");
const { protect, admin } = require("../middlewares/authMiddleware");

const dashboardRouter = express.Router();

dashboardRouter.route("/").get(protect, admin, getDashboardData);

module.exports = { dashboardRouter };
