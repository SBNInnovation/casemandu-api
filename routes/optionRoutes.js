// routes/optionRoutes.js
const express = require("express");
const {
  getOptions,
  createOption,
  getOptionById,
  updateOption,
  deleteOption,
  getProductsByOptionName,
} = require("../controllers/optionController");

const router = express.Router();

// Routes for options
router.route("/").get(getOptions).post(createOption);
router.route("/:id").put(updateOption).delete(deleteOption);
router.route("/:optionName").get(getProductsByOptionName);

module.exports = router;
