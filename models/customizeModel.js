const mongoose = require('mongoose')

const CustomizeSchema = new mongoose.Schema(
  {
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    templateImg: {
      type: String,
      default: '',
      required: true,
    },
    ratio: {
      height: {
        type: Number,
        default: 0,
      },
      width: {
        type: Number,
        default: 0,
      },
    },
    price: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Customize = mongoose.model('Customize', CustomizeSchema)

module.exports = Customize
