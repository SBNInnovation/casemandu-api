const express = require('express')
const {
  addOrderItems,
  getOrders,
  updateOrderStatus,
  getOrderById,
  trackOrder,
} = require('../controllers/orderController')

const { protect, admin } = require('../middlewares/authMiddleware.js')

const router = express.Router()

router.route('/').post(addOrderItems).get(protect, admin, getOrders)
router.route('/track').get(trackOrder)
router.route('/:id').get(getOrderById)
router.route('/:id/status').put(protect, admin, updateOrderStatus)

module.exports = router
