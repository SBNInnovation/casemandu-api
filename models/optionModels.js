// models/optionModel.js
const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name for the option"],
    },
    route: {
      type: String,
      required: [true, "Please add a route for the option"],
      default: function () {
        return `/${this.name.replace(/\s+/g, "-").toLowerCase()}`; // Create a route based on the name
      },
    },
    image: {
      type: String,
      required: [true, "Please add an image URL for the option"], // Image is now required
    },
    features: {
      type: [String],
      required: [true, "Please add features for the option"],
    },
    description: {
      type: String,
      required: [true, "Please add a description for the option"],
    },
    delete_url: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Option = mongoose.model("Option", OptionSchema);

module.exports = Option;
