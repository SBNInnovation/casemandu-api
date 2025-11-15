const express = require('express')
const {
  getProducts,
  createProduct,
  getProductBySlug,
  deleteProduct,
  updateProduct,
  getProductsByCategory,
  changeActivation,
  changeNewStatus,
  getProductForAdmin,
} = require('../controllers/productController.js')

const router = express.Router()

router.route('/').post(createProduct).patch(changeActivation).get(getProductForAdmin)
router.route('/status').put(changeNewStatus)
router
  .route('/:slug')
  .get(getProductBySlug)
  .delete(deleteProduct)
  .put(updateProduct)

router.route('/category/:slug').get(getProductsByCategory)


// router.route('/').post(changeActivation).post(changeNewStatus)

module.exports = router 
