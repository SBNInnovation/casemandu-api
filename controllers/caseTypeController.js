const CaseType = require('../models/caseTypeModel')
const asyncHandler = require('express-async-handler')

// @desc    Fetch all case types
// @route   GET /api/casetypes
// @access  Public

const getCaseTypes = asyncHandler(async (req, res) => {
  const caseTypes = await CaseType.find({})

  res.json(caseTypes)
})

// @desc    Create a case type
// @route   POST /api/casetypes
// @access  Private/Admin

const createCaseType = asyncHandler(async (req, res) => {
  const { name, price } = req.body

  const caseType = new CaseType({
    name,
    price,
  })

  const createdCaseType = await caseType.save()

  res.status(201).json(createdCaseType)
})

module.exports = { getCaseTypes, createCaseType }
