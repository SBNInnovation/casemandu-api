const PhoneModel = require('../models/phoneModel')
const Customize = require('../models/customizeModel')
const expressAsyncHandler = require('express-async-handler')

// @desc   Fetch all phones
// @route  GET /api/phones
// @access Public

const getPhones = expressAsyncHandler(async (req, res) => {
  const activation = req.query.activation?.toString(); // "active" or "inactive"

  const phones = await PhoneModel.find()
    .sort({ name: 1 })
    .populate("models.caseTypes", "name price description");
    
  if (activation === "active") {
    phones.forEach(phone => {
      phone.models = phone.models.filter(model => model.isActivate === true);
    });
  } else if (activation === "inactive") {
    phones.forEach(phone => {
      phone.models = phone.models.filter(model => model.isActivate === false);
    });
  }

  // 3. Optional: remove phones that have no models left after filtering
  // const filteredPhones = phones.filter(phone => phone.models.length > 0);

  res.json(phones);
});


// @desc   Fetch all phone brands
// @route  GET /api/phones/brands
// @access Public

const getPhoneBrands = expressAsyncHandler(async (req, res) => {
  const phones = await PhoneModel.find({})
    .sort({ name: 1 })
    .select('name thumbnail')

  res.json(phones)
})

// @desc Get models by brand
// @route GET /api/phones/brands/:id
// @access Public

const getModelsByBrand = expressAsyncHandler(async (req, res) => {
  const phone = await PhoneModel.findById(req.params.id)

  if (!phone) {
    res.status(404)
    throw new Error('Phone not found')
  }

  res.json(phone.models)
})

// @desc Create a phone
// @route POST /api/phones
// @access Private/Admin

const createBrand = expressAsyncHandler(async (req, res) => {
  let { name, thumbnail } = req.body

  if (!name || !thumbnail) {
    res.status(400)
    throw new Error('All fields are required')
  }
  name = name.toUpperCase()

  const brandExists = await PhoneModel.findOne({ name })

  if (brandExists) {
    res.status(400)
    throw new Error('Brand already exists')
  }

  const phone = new PhoneModel({
    name,
    thumbnail,
  })

  await phone.save()

  res.status(201).json({
    message: 'Brand created',
  })
})

// @desc  Update a phone
// @route PUT /api/phones/:id
// @access Private/Admin

const updateBrand = expressAsyncHandler(async (req, res) => {
  const phone = await PhoneModel.findById(req.params.id)

  if (!phone) {
    res.status(404)
    throw new Error('Phone not found')
  }

  let { name, thumbnail } = req.body
  name = name.toUpperCase()

  if (!name) {
    res.status(400)
    throw new Error('Brand is required')
  }

  const brandExists = await PhoneModel.findOne({
    name,
  })

  if (brandExists) {
    res.status(400)
    throw new Error('Brand already exists')
  }

  phone.name = name || phone.name
  phone.thumbnail = thumbnail || phone.thumbnail

  await phone.save()

  res.status(200).json({
    message: 'Brand updated',
  })
})

// @desc  Insert a phone model
// @route POST /api/phones/models/:id
// @access Private/Admin

const insertPhoneModel = expressAsyncHandler(async (req, res) => {
  const phone = await PhoneModel.findById(req.params.id)

  if (!phone) {
    res.status(404)
    throw new Error('Phone not found')
  }
  let { name, caseTypes, price, templateImg, ratio } = req.body
  name = name.toUpperCase()

  const modelExists = phone?.models.find((model) => model.name === name)

  if (modelExists) {
    res.status(400)
    throw new Error('Model already exists')
  }

  phone.models.push({ name, caseTypes, price, templateImg, ratio })
  await phone.save()
  res.status(201).json({
    message: 'Phone model inserted',
  })
})

// @desc  Delete a phone model
// @route DELETE /api/phones/models/:id
// @access Private/Admin

const deletePhoneModel = expressAsyncHandler(async (req, res) => {
  const phone = await PhoneModel.findById(req.params.id)

  if (!phone) {
    res.status(404)
    throw new Error('Phone not found')
  }
  const model = phone.models.find(
    (model) => String(model._id) === req.query.modelID
  )

  if (!model) {
    res.status(404)
    throw new Error('Model not found')
  }

  phone.models = phone.models.filter(
    (model) => String(model._id) !== req.query.modelID
  )

  await phone.save()

  res.status(200).json({
    message: 'Phone model deleted',
  })
})

// @desc  Update a phone model
// @route PUT /api/phones/models/:id
// @access Private/Admin

const updatePhoneModel = expressAsyncHandler(async (req, res) => {
  const phone = await PhoneModel.findById(req.params.id)

  if (!phone) {
    res.status(404)
    throw new Error('Phone not found')
  }
  const model = phone.models.find(
    (model) => String(model._id) === req.query.modelID
  )

  if (!model) {
    res.status(404)
    throw new Error('Model not found')
  }
  let { name, caseTypes } = req.body

  if (!name) {
    res.status(400)
    throw new Error('Name is required')
  }
  name = name.toUpperCase()

  // check if the new name already exists
  const modelExists = phone.models.find(
    (model) => model.name === name && String(model._id) !== req.query.modelID
  )

  if (modelExists) {
    res.status(400)
    throw new Error('Model already exists')
  }
  model.name = name || model.name
  model.caseTypes = caseTypes || model.caseTypes

  await phone.save()

  res.status(200).json({
    message: 'Phone model updated',
  })
})

// @desc  Update a phone model customize
// @route PUT /api/phones/models/customize/:id
// @access Private/Admin

const updatePhoneModelCustomize = expressAsyncHandler(async (req, res) => {
  const phone = await PhoneModel.findById(req.params.id)

  if (!phone) {
    res.status(404)
    throw new Error('Phone not found')
  }
  const model = phone.models.find(
    (model) => String(model._id) === req.query.modelID
  )

  if (!model) {
    res.status(404)
    throw new Error('Model not found')
  }

  const { price, templateImg, ratio } = req.body

  model.price = price || model.price
  model.templateImg = templateImg
  model.ratio = ratio || model.ratio

  await phone.save()

  res.status(200).json({
    message: 'Phone model updated',
  })
})

// @desc Delete a phone
// @route DELETE /api/phones/:id
// @access Private/Admin

const deleteBrand = expressAsyncHandler(async (req, res) => {
  const phone = await PhoneModel.findById(req.params.id)

  if (!phone) {
    res.status(404)
    throw new Error('Phone not found')
  }

  // delete if the phone has no models
  if (phone.models.length) {
    res.status(400)
    throw new Error('Delete all models first')
  }

  await phone.deleteOne()

  res.status(200).json({
    message: 'Phone deleted',
  })
})

// @desc Get a phone by ID
// @route GET /api/phones/:id
// @access Public

const getBrandsById = expressAsyncHandler(async (req, res) => {
  const phone = await PhoneModel.findById(req.params.id)

  if (!phone) {
    res.status(404)
    throw new Error('Phone not found')
  }

  res.json(phone)
})

// @desc Get a phone model by ID
// @route GET /api/phones/models/:id
// @access Public

const getModelByID = expressAsyncHandler(async (req, res) => {
  // const model = await PhoneModel.findById({ 'models._id': req.params.id })

  // find the only model that matches the id
  const model = await PhoneModel.findOne({
    'models._id': req.params.id,
  })

  const modelObject = model.models.id(req.params.id)

  if (!modelObject || !modelObject?.templateImg) {
    res.status(404)
    throw new Error('Model not found')
  }

  // return the model object
  res.json(modelObject)
})

const changeStatus = async(req,res)=>{
try {
    const { id } = req.query;
    const { activation } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Model Id is required",
      });
    }

    // validation
    if (activation !== "active" && activation !== "inactive") {
      return res.status(400).json({
        success: false,
        message: "Invalid activation value. Use 'active' or 'inactive'.",
      });
    }

    const isActivate = activation === "active";

    const updated = await PhoneModel.findByIdAndUpdate(
      id,
      { isActivate },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Model not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isActivate ? "Activated" : "Deactivated",
      data: updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getPhones,
  getPhoneBrands,
  getBrandsById,
  updateBrand,
  createBrand,
  insertPhoneModel,
  updatePhoneModel,
  deletePhoneModel,
  deleteBrand,
  getModelsByBrand,
  getModelByID,
  updatePhoneModelCustomize,
  changeStatus
}
