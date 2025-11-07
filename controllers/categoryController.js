const asyncHandler = require('express-async-handler')
const Category = require('../models/categoryModel.js')

// @desc    Get all category
// route    GET /api/categories
// access   public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.find({}).sort({ createdAt: -1 })

  res.status(200).json(category)
})

// @desc   Get category by id
// route   GET /api/categories/:id
// access  public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)

  if (category) {
    res.status(200).json(category)
  } else {
    res.status(404)
    throw new Error('Category not found')
  }
})

// @desc  Get all parent category
// route  GET /api/categories/parent
// access public
const getParentCategory = asyncHandler(async (req, res) => {
  const category = await Category.find({ parentCategory: null })

  res.status(200).json(category)
})

// @desc  Get all sub category of a parent category
// route  GET /api/categories/sub/:id
// access public
const getSubCategoryByParentId = asyncHandler(async (req, res) => {
  const category = await Category.find({
    parentCategory: req.params.id,
  })

  res.status(200).json(category)
})

// @desc    Insert category
// route    POST /api/categories
// access   private/admin
const createCategory = asyncHandler(async (req, res) => {
  const { title, description, image, parentCategory, price } = req.body

  const category = await Category.create({
    title,
    description,
    image,
    parentCategory,
  })

  res.status(201).json(category)
})

// @desc  Delete category
// route  DELETE /api/categories/:id
// access private/admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id)

  if (category) {
    res.json({ message: 'Category deleted' })
  } else {
    res.status(404)
    throw new Error('Category not found')
  }
})

// @desc  Update category
// route  PUT /api/categories/:id
// access private/admin

const updateCategory = asyncHandler(async (req, res) => {
  const { title, description, image, parentCategory, price } = req.body

  const category = await Category.findById(req.params.id)

  if (category) {
    category.title = title || category.title
    category.description = description || category.description
    category.image = image || category.image
    category.parentCategory = parentCategory || category.parentCategory

    const updatedCategory = await category.save()
    res.json(updatedCategory)
  } else {
    res.status(404)
    throw new Error('Category not found')
  }
})

module.exports = {
  getCategory,
  getCategoryById,
  getParentCategory,
  getSubCategoryByParentId,
  createCategory,
  deleteCategory,
  updateCategory,
}
