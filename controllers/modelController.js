const asyncHandler = require('express-async-handler')
const Model = require('../models/modelModel.js')
const Brand = require('../models/brandModel')

// desc:    Get all models
// route:   GET /api/models
// access:  public

const getModels = asyncHandler(async (req, res) => {
  const activation = req.query.activation?.toString();
  let query = {}
  if(activation === "active"){
    query.isActivate = true;
  }else if(activation === "inactive"){
    query.isActivate = false
  }

  const models = await Model.find(query)
    .populate('brand', 'title')
    .populate('caseTypes', 'name price')
    .sort({ title: 1 })

  res.status(200).json(models)
})

// desc: Get models by brand
// route: GET /api/models/brand/:id
// access: public

const getModelsByBrand = asyncHandler(async (req, res) => {
  const models = await Model.find({ brand: req.params.id })
    .populate('brand', '_id title')
    .sort({ title: 1 })

  res.status(200).json(models)
})

// desc:  Create a model
// route: POST /api/models
// access: private/admin

const createModel = asyncHandler(async (req, res) => {
  const { title, brand } = req.body

  const isBrand = await Brand.findById(brand)

  if (!isBrand) {
    res.status(404)
    throw new Error('Brand not found')
  }

  const model = new Model({
    title,
    brand,
  })

  await model.save()

  if (model) {
    res.status(201).json({
      _id: model._id,
      title: model.title,
      brand: model.brand,
    })
  } else {
    res.status(400)
    throw new Error('Invalid brand data')
  }
})

// desc:  Delete a model
// route: DELETE /api/models/:id
// access: private/admin

const deleteModel = asyncHandler(async (req, res) => {
  const model = await Model.findByIdAndDelete(req.params.id)

  if (model) {
    model.remove()
    res.json({ message: 'Model deleted' })
  } else {
    res.status(404)
    throw new Error('Model not found')
  }
})

// desc:  Update a model
// route: PUT /api/models/:id
// access: private/admin

const updateModel = asyncHandler(async (req, res) => {
  const { title, brand } = req.body

  const isBrand = await Brand.findById(brand)

  if (brand && !isBrand) {
    res.status(404)
    throw new Error('Brand not found')
  }

  const model = await Model.findById(req.params.id)

  if (model) {
    model.title = title || model.title
    model.brand = brand || model.brand

    const updatedModel = await model.save()
    res.json(updatedModel)
  } else {
    res.status(404)
    throw new Error('Brand not found')
  }
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

    const updated = await Model.findByIdAndUpdate(
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
  getModels,
  getModelsByBrand,
  createModel,
  updateModel,
  deleteModel,
  changeStatus
}
