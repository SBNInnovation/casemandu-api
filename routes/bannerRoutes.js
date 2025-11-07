const express = require('express')
const {
  getBanner,
  createBanner,
  deleteBanner,
  updateBanner,
} = require('../controllers/bannerController')

const router = express.Router()

router.route('/').get(getBanner).post(createBanner)
router.route('/:id').put(updateBanner).delete(deleteBanner)

module.exports = router
