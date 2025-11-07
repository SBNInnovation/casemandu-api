const express = require('express')
const {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getOfferBySlug,
} = require('../controllers/offerController')

const router = express.Router()

router.route('/').get(getOffers).post(createOffer)
router.route('/:slug').get(getOfferBySlug).put(updateOffer).delete(deleteOffer)

module.exports = router
