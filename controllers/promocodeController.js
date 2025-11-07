const expressAsyncHandler = require('express-async-handler')
const PromocodeModel = require('../models/promocodeModel.js')

// @desc   Fetch all promocodes that are active and not expired
// @route  GET /api/promocodes
// @access Public

const getPromocodes = expressAsyncHandler(async (req, res) => {
  const promocodes = await PromocodeModel.find({
    isActive: true,
    expiresAt: { $gte: new Date() },
    displayOnHome: true,
  })

  res.status(200).json(promocodes)
})

// @desc  Fetch all promocodes
// @route GET /api/promocodes/all
// @access Private/Admin

const getAllPromocodes = expressAsyncHandler(async (req, res) => {
  const promocodes = await PromocodeModel.find({}).sort({ createdAt: -1 })

  res.status(200).json(promocodes)
})

// @desc  Create a promocode
// @route POST /api/promocodes
// @access Private/Admin

const createPromocode = expressAsyncHandler(async (req, res) => {
  const {
    code,
    discount,
    maxAmount,
    isActive,
    expiresAt,
    title,
    displayOnHome,
  } = req.body

  if (!title || !code || !discount || !expiresAt) {
    res.status(400)
    throw new Error('All fields are required')
  }

  const promocode = new PromocodeModel({
    title,
    code,
    discount,
    maxAmount,
    isActive,
    expiresAt,
    displayOnHome,
  })

  await promocode.save()
  res.status(201).json({
    message: `Promocode has been created successfully`,
  })
})

// @desc  Get a promocode by code
// @route GET /api/promocodes/:code
// @access Public

const getPromocodeByCode = expressAsyncHandler(async (req, res) => {
  const promocode = await PromocodeModel.findOne({
    code: req.params.code,
    expiresAt: { $gte: new Date() },
    isActive: true,
  })

  if (!promocode) {
    res.status(404)
    throw new Error('Promocode not found')
  }

  res.status(200).json(promocode)
})

// @desc  Delete a promo code
// @route DELETE /api/promocodes/:id
// @access Private/Admin

const deletePromocode = expressAsyncHandler(async (req, res) => {
  const promocode = await PromocodeModel.findById(req.params.id)

  if (!promocode) {
    res.status(404)
    throw new Error('Promocode not found')
  }

  await promocode.deleteOne()
  res.status(200).json({ message: 'Promocode has been deleted successfully' })
})

// @desc  Update a promocode
// @route PUT /api/promocodes/:id
// @access Private/Admin

const updatePromocode = expressAsyncHandler(async (req, res) => {
  const promocode = await PromocodeModel.findById(req.params.id)

  if (!promocode) {
    res.status(404)
    throw new Error('Promocode not found')
  }

  const {
    code,
    discount,
    maxAmount,
    isActive,
    expiresAt,
    title,
    displayOnHome,
  } = req.body

  if (!title || !code || !discount || !expiresAt) {
    res.status(400)
    throw new Error('All fields are required')
  }

  promocode.title = title || promocode.title
  promocode.code = code || promocode.code
  promocode.discount = discount || promocode.discount
  promocode.maxAmount = maxAmount || promocode.maxAmount

  promocode.isActive = isActive
  promocode.expiresAt = expiresAt || promocode.expiresAt
  promocode.displayOnHome = displayOnHome

  await promocode.save()
  res.status(200).json({ message: 'Promocode has been updated successfully' })
})

module.exports = {
  getPromocodes,
  getAllPromocodes,
  createPromocode,
  getPromocodeByCode,
  deletePromocode,
  updatePromocode,
}
