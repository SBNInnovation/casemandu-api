const express = require('express')
const {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/brandController')

const router = express.Router()

router.route('/').get(getBrands).post(createBrand)
router.route('/:id').put(updateBrand).delete(deleteBrand)

module.exports = router
