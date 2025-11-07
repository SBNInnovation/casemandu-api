const mongoose = require('mongoose')

const CustomCaseSchema = new mongoose.Schema(
  {
    backgroundImg: {
      type: String,
      default: '',
    },
    foregroundImg: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

const CustomCase = mongoose.model('CustomCase', CustomCaseSchema)

module.exports = CustomCase
