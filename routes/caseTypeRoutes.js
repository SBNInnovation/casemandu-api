const express = require('express')

const router = express.Router()

const {
  getCaseTypes,
  createCaseType,
} = require('../controllers/caseTypeController')

router.route('/').get(getCaseTypes).post(createCaseType)

module.exports = router
