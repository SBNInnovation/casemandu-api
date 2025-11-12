const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
    },
    slug:{
      type:String,
      unique:true
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
)

const Category = mongoose.model('Category', CategorySchema)

module.exports = Category
