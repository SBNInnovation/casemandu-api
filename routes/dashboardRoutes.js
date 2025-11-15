const express = require("express");
const { getDashboardData } = require("../controllers/dashboard");

const dashboardRouter = express.Router();

dashboardRouter.route("/").get(getDashboardData)

module.exports ={dashboardRouter}