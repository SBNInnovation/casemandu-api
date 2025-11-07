const mongoose = require('mongoose')

const sliderImageSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
})

const SliderImage = mongoose.model('SliderImage', sliderImageSchema)

module.exports = SliderImage
