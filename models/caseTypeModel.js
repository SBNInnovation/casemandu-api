const mongoose = require('mongoose')

const caseTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const CaseType = mongoose.model('CaseType', caseTypeSchema)

module.exports = CaseType
