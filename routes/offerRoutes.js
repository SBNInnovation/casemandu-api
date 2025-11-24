const express = require('express')
const {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getOfferBySlug,
} = require('../controllers/offerController')
const multer = require("multer")

const router = express.Router()

const storage = multer.memoryStorage()

const uploader = multer(storage)

router.post("/",uploader.single("image"),createOffer)
router.route('/').get(getOffers)
router.put("/:slug",uploader.single("image"),updateOffer)
router.route('/:slug').get(getOfferBySlug).delete(deleteOffer)

module.exports = router
