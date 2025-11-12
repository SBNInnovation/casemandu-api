const express = require('express')
const {
  getProducts,
  createProduct,
  getProductBySlug,
  deleteProduct,
  updateProduct,
  getProductsByCategory,
  changeActivation,
} = require('../controllers/productController.js')

const router = express.Router()

router.route('/').get(getProducts).post(createProduct).patch(changeActivation)
router
  .route('/:slug')
  .get(getProductBySlug)
  .delete(deleteProduct)
  .put(updateProduct)

router.route('/category/:slug').get(getProductsByCategory)

module.exports = router
