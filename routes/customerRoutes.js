const express = require('express')
const {
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController')

const router = express.Router()

router.route('/').get(getCustomer).post(createCustomer)
router.route('/:id').put(updateCustomer).delete(deleteCustomer)

module.exports = router
