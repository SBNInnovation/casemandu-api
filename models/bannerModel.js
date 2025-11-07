const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    display: {
      type: Number,
      required: true,
      default: 1,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
)

const Banner = mongoose.model('Banner', bannerSchema)

module.exports = Banner
