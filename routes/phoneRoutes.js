const express = require('express')
const {
  deletePhoneModel,
  insertPhoneModel,
  updatePhoneModel,
  getPhoneBrands,
  createBrand,
  deleteBrand,
  updateBrand,
  getBrandsById,
  getPhones,
  updatePhoneModelCustomize,
  getModelByID,
  changeStatus,
} = require('../controllers/phoneController')
const { protect, admin } = require('../middlewares/authMiddleware')

const router = express.Router()

router.route('/').get(getPhones).patch(changeStatus)
router.route('/brands').get(getPhoneBrands).post(protect, admin, createBrand)
router
  .route('/brands/:id')
  .get(getBrandsById)
  .delete(protect, admin, deleteBrand)
  .put(protect, admin, updateBrand)
  .post(protect, admin, insertPhoneModel)

router
  .route('/models/customize/:id')
  .put(protect, admin, updatePhoneModelCustomize)

router
  .route('/models/:id')
  .get(getModelByID)
  .put(protect, admin, updatePhoneModel)
  .delete(protect, admin, deletePhoneModel)

module.exports = router
