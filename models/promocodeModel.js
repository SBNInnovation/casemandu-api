const mongoose = require('mongoose')
const promocodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    displayOnHome: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const PromocodeModel =
  mongoose.models.promocodes || mongoose.model('promocodes', promocodeSchema)

module.exports = PromocodeModel
