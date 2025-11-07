const asyncHandler = require('express-async-handler')
const CustomCase = require('../models/customCaseModel.js')

// desc:    Get all customCases
// route:   GET /api/customCases
// access:  public

const getCustomCase = asyncHandler(async (req, res) => {
  const customCases = await CustomCase.find({}).sort({ title: 1 })

  res.status(200).json(customCases)
})

// desc:  Create a customCase
// route: POST /api/customCases
// access: private/admin

const createCustomCase = asyncHandler(async (req, res) => {
  const { backgroundImg, foregroundImg, price, description, category } =
    req.body

  const customCase = new CustomCase({
    backgroundImg,
    foregroundImg,
    price,
    description,
    category,
  })

  await customCase.save()

  if (customCase) {
    res.status(201).json({
      _id: customCase._id,
      backgroundImg: customCase.backgroundImg,
      foregroundImg: customCase.foregroundImg,
      price: customCase.price,
      description: customCase.description,
      category: customCase.category,
    })
  } else {
    res.status(400)
    throw new Error('Invalid customCase data')
  }
})

// desc:  Delete a customCase
// route: DELETE /api/customCases/:id
// access: private/admin

const deleteCustomCase = asyncHandler(async (req, res) => {
  const customCase = await CustomCase.findByIdAndDelete(req.params.id)

  if (customCase) {
    res.json({ message: 'CustomCase deleted' })
  } else {
    res.status(404)
    throw new Error('CustomCase not found')
  }
})

module.exports = {
  getCustomCase,
  createCustomCase,
  deleteCustomCase,
}
