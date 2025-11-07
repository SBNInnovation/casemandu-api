const mongoose = require('mongoose')

const offerSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0.0,
      required: true,
    },
    discount: {
      type: Number,
      default: 0.0,
    },
    models: [String],
  },
  {
    timestamps: true,
  }
)

const Offer = mongoose.model('Offer', offerSchema)

module.exports = Offer
