const express = require('express')
const {
  createPromocode,
  deletePromocode,
  getAllPromocodes,
  getPromocodeByCode,
  getPromocodes,
  updatePromocode,
} = require('../controllers/promocodeController.js')
const { admin, protect } = require('../middlewares/authMiddleware.js')

const router = express.Router()

router.route('/').get(getPromocodes).post(protect, admin, createPromocode)
router.route('/all').get(protect, admin, getAllPromocodes)
router.route('/:code').get(getPromocodeByCode)
router
  .route('/:id')
  .put(protect, admin, updatePromocode)
  .delete(protect, admin, deletePromocode)

module.exports = router
