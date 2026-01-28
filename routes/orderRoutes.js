const express = require("express");
const {
  addOrderItems,
  getOrders,
  updateOrderStatus,
  getOrderById,
  trackOrder,
  deleteOrder,
} = require("../controllers/orderController");
const multer = require("multer");
const { protect, admin } = require("../middlewares/authMiddleware.js");

const router = express.Router();

const storage = multer.memoryStorage();

const uploader = multer(storage);

router.post(
  "/",
  uploader.fields([
    { name: "paymentImage", maxCount: 1 },
    { name: "customImage" },
  ]),
  addOrderItems,
);
router.route("/").get(protect, admin, getOrders);
router.route("/track").get(trackOrder);
router.route("/:id").get(getOrderById).delete(deleteOrder);
router.route("/:id/status").put(protect, admin, updateOrderStatus);

module.exports = router;
