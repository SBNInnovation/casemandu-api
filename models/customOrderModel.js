const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    orderItems: {
      name: { type: String, require: true },
      qty: { type: Number, require: true },
      image: { type: String, require: true },
      price: { type: Number, require: true },
    },
    name: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'Pending',
    },
    totalPrice: {
      type: Number,
    },
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    additionalInfo: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentImage: {
      type: String,
      default: '',
    },
    shippingCharge: {
      type: Number,
      default: 150,
    },
    shippedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
