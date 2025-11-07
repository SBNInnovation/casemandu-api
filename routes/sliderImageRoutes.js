const express = require('express')
const {
  getSliderImages,
  createSliderImages,
  deleteSliderImages,
  updateSliderImages,
} = require('../controllers/sliderImageController')

const router = express.Router()
router.route('/').get(getSliderImages).post(createSliderImages)
router.route('/:id').delete(deleteSliderImages).put(updateSliderImages)

module.exports = router
