const express = require('express')
const {
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController')
const multer = require("multer")
const router = express.Router()
const storage = multer.memoryStorage()
const uploader = multer(storage)
router.post("/",uploader.single("image"),createCustomer)
router.route('/').get(getCustomer)
router.put("/:id",uploader.single("image"),updateCustomer)
router.route('/:id').delete(deleteCustomer)

module.exports = router
