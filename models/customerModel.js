const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Customer = mongoose.model('Customer', customerSchema)

module.exports = Customer
