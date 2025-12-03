// models/productModel.js
const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
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
      ref: "Category",
      required: true,
    },
    option: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Option", // This will reference the Option model
    },
    tags: [
      {
        type: String,
      },
    ],
    features:{
      type:[String],
      default:[]
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: String,
      default: "",
      required: true,
    },
    discount: {
      type: Number,
      default: 0.0,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    saleCount: {
      type: Number,
      default: 0,
    },
    isNew:{
      type:Boolean,
      default: false,
    },
    // new: {
    //   type: Boolean,
    //   default: false,
    // },
    isActivate:{
      type:Boolean,
      default:false
    },
    createdAt:{
      type:Date,
      default:Date.now()
    }
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
