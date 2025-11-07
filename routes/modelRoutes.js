const express = require('express')
const {
  getModels,
  createModel,
  updateModel,
  deleteModel,
  getModelsByBrand,
} = require('../controllers/modelController')

const router = express.Router()

router.route('/').get(getModels).post(createModel)
router.route('/:id').put(updateModel).delete(deleteModel)
router.route('/brand/:id').get(getModelsByBrand)

module.exports = router
