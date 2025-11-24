// desc:    Get all customizes
// route:   GET /api/customizes
// access:  public

const asyncHandler = require('express-async-handler')
const Customize = require('../models/customizeModel.js')
const sharp = require("sharp")
const { uploadToCloudinary, deleteFile } = require('../utils/cloudinary.js')

const getCustomize = asyncHandler(async (req, res) => {
  const customize = await Customize.find({})
    .populate('model')
    .populate('category')

  res.status(200).json(customize)
})

// desc:  Create a customize
// route: POST /api/customizes
// access: private/admin

const createCustomize = asyncHandler(async (req, res) => {
  const { model, category, ratio, price } = req.body;

  const templateImg = req.file;

  if (!templateImg) {
    return res
      .status(400)
      .json({ success: false, message: "Please upload the photo." });
  }

    // Compress + convert to webp
    const optimizedBuffer = await sharp(templateImg.buffer)
      .webp({ quality: 80 })
      .toBuffer();
  
    const base64Data = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
  
    // Upload to Cloudinary
    const uploaded = await uploadToCloudinary(
      base64Data,
      "customize"
    );

  const customize = new Customize({
    model,
    category,
    templateImg:uploaded.secure_url,
    ratio,
    price,
  })

  await customize.save()

  if (customize) {
    res.status(201).json({
      _id: customize._id,
      model: customize.model,
      category: customize.category,
      templateImg: customize.templateImg,
      ratio: customize.ratio,
      price: customize.price,
    })
  } else {
    res.status(400)
    throw new Error('Invalid customize data')
  }
})

// desc: Get a customize by ID
// route: GET /api/customizes/:id
// access: public

const getCustomizeById = asyncHandler(async (req, res) => {
  const customize = await Customize.findById(req.params.id)
    .populate('model')
    .populate('category')

  if (customize) {
    res.status(200).json(customize)
  } else {
    res.status(404)
    throw new Error('Customize not found')
  }
})

// desc: Update a customizes
// route: PUT /api/customizes/:id
// access: private/admin

const updateCustomize = asyncHandler(async (req, res) => {
  const { model, category,ratio, price } = req.body

  const templateImg = req.file;

  const customize = await Customize.findById(req.params.id)
  let uploaded, base64Data;
  
    if (templateImg) {
      const optimizedBuffer = await sharp(image.buffer)
        .webp({ quality: 80 })
        .toBuffer();
  
      base64Data = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
  
      uploaded = await uploadToCloudinary(base64Data, "products");
    }

  if (customize) {
    customize.model = model || customize.model
    customize.category = category || customize.category
    customize.templateImg = uploaded?.secure_url || customize.templateImg
    customize.ratio = ratio || customize.ratio
    customize.price = price || customize.price

    const updatedCustomize = await customize.save()

    res.status(200).json(updatedCustomize)
  } else {
    res.status(404)
    throw new Error('Customize not found')
  }
})

// desc: Delete a customizes
// route: DELETE /api/customizes/:id
// access: private/admin

const deleteCustomize = asyncHandler(async (req, res) => {
  const customize = await Customize.findById(req.params.id)

  if (customize) {
    await deleteFile(customize.templateImg)
    await customize.deleteOne()
    res.status(200).json({ message: 'Customize removed' })
  } else {
    res.status(404)
    throw new Error('Customize not found')
  }
})

// desc: Get all customizes by brand
// route: GET /api/customizes/brand/:id
// access: public

const getCustomizeByBrand = asyncHandler(async (req, res) => {
  const customizes = await Customize.find({})
    .populate('model')
    .populate('category')

  const customizeWithBrandID = customizes.filter(
    (customize) => customize.model.brand._id.toString() === req.params.id
  )

  res.status(200).json(customizeWithBrandID)
})

module.exports = {
  getCustomize,
  createCustomize,
  getCustomizeById,
  updateCustomize,
  deleteCustomize,
  getCustomizeByBrand,
}
