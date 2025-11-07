const express = require('express')
const {
  getCategory,
  createCategory,
  getParentCategory,
  getSubCategoryByParentId,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController')

const router = express.Router()

router.route('/').get(getCategory).post(createCategory)
router.route('/parent').get(getParentCategory)
router
  .route('/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory)
router.route('/sub/:id').get(getSubCategoryByParentId)

module.exports = router
