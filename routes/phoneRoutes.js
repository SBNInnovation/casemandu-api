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
  deletePhoneModelCustomize,
} = require('../controllers/phoneController')
const { protect, admin } = require('../middlewares/authMiddleware')
const multer = require("multer");

const router = express.Router()

const storage= multer.memoryStorage();

const uploader = multer({storage});

router.route('/').get(getPhones).patch(changeStatus)
router.route('/brands').get(getPhoneBrands).post(protect, admin, createBrand)
router
  .route('/brands/:id')
  .get(getBrandsById)
  .delete(protect, admin, deleteBrand)
  .put(protect, admin, updateBrand)
  .post(protect, admin, insertPhoneModel)

router
  .put('/models/customize/:id', uploader.single("templateImg"), protect, admin, updatePhoneModelCustomize)
  .delete("/models/customize/:id",deletePhoneModelCustomize)

router
  .route('/models/:id')
  .get(getModelByID)
  .put(protect, admin, updatePhoneModel)
  .delete(protect, admin, deletePhoneModel)

module.exports = router
const deletePhoneModelCustomize = async (req, res) => {
  try {
    const id = req.params.id;

    const checkPhone = await PhoneModel.findById(id);
    if (!checkPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone not found",
      });
    }

    const { modelID } = req.query;

    const checkModel = checkPhone.models.find(
      (model) => String(model._id) === modelID
    );

    if (!checkModel) {
      return res.status(400).json({
        success: false,
        message: "Model not found",
      });
    }

    // remove the model
    checkPhone.models = checkPhone.models.filter(
      (model) => String(model._id) !== modelID
    );

    await checkPhone.save();

    res.status(200).json({
      success: true,
      message: "Model deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
