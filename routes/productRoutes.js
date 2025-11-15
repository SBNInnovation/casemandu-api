const express = require('express')

const {
  getProductBySlug,
  deleteProduct,
  updateProduct,
  getProductsByCategory,
  changeActivation,
  changeNewStatus,
  getProductForAdmin,
  addProduct,
} = require('../controllers/productController.js')

const router = express.Router()

router.route('/').post(addProduct).patch(changeActivation).get(getProductForAdmin)
router.route('/status').put(changeNewStatus)
router
  .route('/:slug')
  .get(getProductBySlug)
  .delete(deleteProduct)
  .put(updateProduct)

router.route('/category/:slug').get(getProductsByCategory)


// router.route('/').post(changeActivation).post(changeNewStatus)

module.exports = router 
