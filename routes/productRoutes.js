const express = require('express')
const { createProduct, changeActivation, getProductForAdmin, changeNewStatus, getProductBySlug, deleteProduct, updateProduct, getProductsByCategory } = require('../controllers/productController')

const router = express.Router()

router.route("/").post(createProduct)
router.route('/').patch(changeActivation).get(getProductForAdmin)
router.route('/status').put(changeNewStatus)
router
  .route('/:slug')
  .get(getProductBySlug)
  .delete(deleteProduct)
  .put(updateProduct)

router.route('/category/:slug').get(getProductsByCategory)


// router.route('/').post(changeActivation).post(changeNewStatus)

module.exports = router 
