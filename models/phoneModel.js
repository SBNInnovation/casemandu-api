const mongoose = require('mongoose')
const phoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    models: [
      {
        name: {
          type: String,
          required: true,
        },
        caseTypes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CaseType',
          },
        ],
        price: {
          type: Number,
        },
        templateImg: {
          type: String,
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
      },
    ],
  },
  {
    timestamps: true,
  }
)

const PhoneModel =
  mongoose.models.phones || mongoose.model('Phone', phoneSchema)

module.exports = PhoneModel
