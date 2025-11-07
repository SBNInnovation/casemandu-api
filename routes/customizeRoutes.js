const express = require('express')
const {
  getCustomize,
  createCustomize,
  getCustomizeByBrand,
  getCustomizeById,
  updateCustomize,
  deleteCustomize,
} = require('../controllers/customizeController.js')

const router = express.Router()

router.route('/').get(getCustomize).post(createCustomize)
router
  .route('/:id')
  .get(getCustomizeById)
  .put(updateCustomize)
  .delete(deleteCustomize)
router.route('/brand/:id').get(getCustomizeByBrand)

module.exports = router
