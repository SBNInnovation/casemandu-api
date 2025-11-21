const express = require('express')
const { createProduct, changeActivation, getProductForAdmin, changeNewStatus, getProductBySlug, deleteProduct, updateProduct, getProductsByCategory } = require('../controllers/productController')
const multer = require("multer")

const router = express.Router()

const storage= multer.memoryStorage();

const uploader = multer({storage});

router.post("/",uploader.single("image"),createProduct)
router.route('/').patch(changeActivation).get(getProductForAdmin)
router.route('/status').put(changeNewStatus)
router
  .route('/:slug')
  .get(getProductBySlug)
  .delete(deleteProduct)
router.put("/:slug",uploader.single("image"),updateProduct)

router.route('/category/:slug').get(getProductsByCategory)


// router.route('/').post(changeActivation).post(changeNewStatus)

module.exports = router 
