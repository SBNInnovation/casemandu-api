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
const multer = require("multer")

const router = express.Router();

const storage= multer.memoryStorage();

const uploader = multer({storage});

// Routes for options
router.route("/").get(getOptions);
router.post("/",uploader.single("image"),createOption)
router.route("/:id").delete(deleteOption);
router.put("/:id",uploader.single("image"),updateOption)
router.route("/:optionName").get(getProductsByOptionName);

module.exports = router;
