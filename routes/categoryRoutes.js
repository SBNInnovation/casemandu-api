const express = require('express')
const {
  getCategory,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController')
const multer =require("multer")

const router = express.Router()

const storage= multer.memoryStorage();

const uploader = multer({storage});


router.post("/",uploader.single("image"),createCategory)
router.route('/').get(getCategory)


router.put("/:id",uploader.single("image"),updateCategory)
router
  .route('/:id')
  .get(getCategoryById)
  .delete(deleteCategory)



module.exports = router
