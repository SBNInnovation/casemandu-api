const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    qty: { type: Number, require: true },
    image: { type: String, require: true },
    price: { type: Number, require: true },
    variant: { type: String },
  },
  {
    _id: false, // Don't generate separate IDs for order items
  }
);

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: Number,
      required: true,
    },
    orderItems: [orderItemSchema],
    customImage: {
      type: String,
      default: "",
    },
    customCaseCoordinates: {
      height: {
        type: Number,
        default: 0,
      },
      width: {
        type: Number,
        default: 0,
      },
      x: {
        type: Number,
        default: 0,
      },
      y: {
        type: Number,
        default: 0,
      },
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
    email: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
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
      default: "",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentImage: {
      type: String,
      default: "",
    },

    shippedAt: {
      type: Date,
    },
    priceSummary: {
      promoCode: { type: String },
      total: { type: Number, required: true, default: 0.0 },
      discountAmount: { type: Number, required: true, default: 0.0 },
      deliveryCharge: { type: Number, required: true, default: 0.0 },
      grandTotal: { type: Number, required: true, default: 0.0 },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
