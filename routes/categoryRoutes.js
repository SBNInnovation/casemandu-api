const express = require('express')
const {
  getCategory,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController')

const router = express.Router()

router.route('/').get(getCategory).post(createCategory)

router
  .route('/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory)


module.exports = router
