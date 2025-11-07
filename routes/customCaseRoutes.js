const express = require('express')

const {
  getCustomCase,
  createCustomCase,
  deleteCustomCase,
} = require('../controllers/customCaseController')

const router = express.Router()

router.route('/').get(getCustomCase).post(createCustomCase)
router.route('/:id').delete(deleteCustomCase)

module.exports = router
