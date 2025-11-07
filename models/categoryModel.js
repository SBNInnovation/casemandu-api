const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
    },
    isCase: {
      type: Boolean,
      default: false,
    },
    extraField: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

const Category = mongoose.model('Category', CategorySchema)

module.exports = Category
