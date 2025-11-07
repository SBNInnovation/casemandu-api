const asyncHandler = require('express-async-handler')
const Brand = require('../models/brandModel.js')

// desc:    Get all brands
// route:   GET /api/brands
// access:  public

const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({}).sort({ title: 1 })

  res.status(200).json(brands)
})

// desc:  Create a brand
// route: POST /api/brands
// access: private/admin

const createBrand = asyncHandler(async (req, res) => {
  const { title } = req.body

  const brand = new Brand({
    title,
  })

  await brand.save()

  if (brand) {
    res.status(201).json({
      _id: brand._id,
      title: brand.title,
    })
  } else {
    res.status(400)
    throw new Error('Invalid brand data')
  }
})

// desc:  Delete a brand
// route: DELETE /api/brands/:id
// access: private/admin

const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id)

  if (brand) {
    res.json({ message: 'Brand deleted' })
  } else {
    res.status(404)
    throw new Error('Brand not found')
  }
})

// desc:  Update a brand
// route: PUT /api/brands/:id
// access: private/admin

const updateBrand = asyncHandler(async (req, res) => {
  const { title } = req.body

  const brand = await Brand.findById(req.params.id)

  if (brand) {
    brand.title = title || brand.title

    const updatedBrand = await brand.save()
    res.json(updatedBrand)
  } else {
    res.status(404)
    throw new Error('Brand not found')
  }
})

module.exports = {
  getBrands,
  createBrand,
  deleteBrand,
  updateBrand,
}
