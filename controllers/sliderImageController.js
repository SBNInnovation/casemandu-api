const asyncHandler = require('express-async-handler')
const SliderImage = require('../models/sliderImageModel.js')

// desc:    Get all sliderImages
// route:   GET /api/sliderImages
// access:  public

const getSliderImages = asyncHandler(async (req, res) => {
  const sliderImages = await SliderImage.find({}).sort({ createdAt: -1 })

  res.status(200).json(sliderImages)
})

// desc:  Create a sliderImages
// route: POST /api/sliderImages
// access: private/admin

const createSliderImages = asyncHandler(async (req, res) => {
  const { link, image } = req.body

  const sliderImage = new SliderImage({
    link,
    image,
  })

  await sliderImage.save()

  if (sliderImage) {
    res.status(201).json({
      _id: sliderImage._id,
      link: sliderImage.link,
      image: sliderImage.image,
    })
  } else {
    res.status(400)
    throw new Error('Invalid Slider Image data')
  }
})

// desc:  Delete a sliderImages
// route: DELETE /api/sliderImages/:id
// access: private/admin

const deleteSliderImages = asyncHandler(async (req, res) => {
  const sliderImage = await SliderImage.findByIdAndDelete(req.params.id)

  if (sliderImage) {
    res.json({ message: 'Slider Image deleted' })
  } else {
    res.status(404)
    throw new Error('Slider Image not found')
  }
})

// desc:  Update a sliderImages
// route: PUT /api/sliderImages/:id
// access: private/admin

const updateSliderImages = asyncHandler(async (req, res) => {
  const { image, link } = req.body

  const sliderImage = await SliderImage.findById(req.params.id)

  if (sliderImage) {
    sliderImage.link = link || sliderImage.link
    sliderImage.image = image || sliderImage.link

    const updatedSliderImage = await sliderImage.save()
    res.json(updatedSliderImage)
  } else {
    res.status(404)
    throw new Error('sliderImage not found')
  }
})

module.exports = {
  getSliderImages,
  createSliderImages,
  deleteSliderImages,
  updateSliderImages,
}
