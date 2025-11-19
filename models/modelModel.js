const mongoose = require('mongoose')

const modelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    caseTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CaseType',
      },
    ],
    isActivate:{
      type:Boolean,
      default:false
    }
  },
  {
    timestamps: true,
  }
)

const Model = mongoose.model('Model', modelSchema)

module.exports = Model
