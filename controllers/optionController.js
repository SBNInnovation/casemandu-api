// controllers/optionController.js
const asyncHandler = require("express-async-handler");
const Option = require("../models/optionModels.js");
const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");
const { uploadToCloudinary, deleteFile } = require("../utils/cloudinary.js");
const sharp = require("sharp")

// @desc    Get all options
// route    GET /api/options
// access   public
 const getOptions = asyncHandler(async (req, res) => {
  // Fetch all options
  const options = await Option.find({}).sort({ createdAt: -1 });

  // Attach product counts to each option
  const optionsWithCounts = await Promise.all(
    options.map(async (opt) => {
      const productCount = await Product.countDocuments({ option: opt._id });
      return {
        _id: opt._id,
        name: opt.name,
        route: opt.route,
        image: opt.image,
        createdAt: opt.createdAt,
        updatedAt: opt.updatedAt,
        productCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: optionsWithCounts,
  });
});

// @desc    Get option by id
// route    GET /api/options/:id
// access   public
const getOptionById = asyncHandler(async (req, res) => {
  const option = await Option.findById(req.params.id);

  if (option) {
    res.status(200).json({success:true,data:option});
  } else {
    res.status(404);
    throw new Error("Option not found");
  }
});

// @desc    Create a new option
// route    POST /api/options
// access   private/admin
const createOption = asyncHandler(async (req, res) => {
  const { name, route } = req.body;

  const image = req.file

  if (!name || !route) {
    res.status(400);
    throw new Error("Please add all fields (name, route, image)");
  }

  if (!image) {
    return res
      .status(400)
      .json({ success: false, message: "Please upload the photo." });
  }

  // Compress + convert to webp
  const optimizedBuffer = await sharp(image.buffer)
    .webp({ quality: 80 })
    .toBuffer();

  // Upload to Cloudinary
  const uploaded = await uploadToCloudinary(
    optimizedBuffer,
    "options"
  );

  const option = await Option.create({
    name,
    route,
    image:uploaded.secure_url
  });

  res.status(201).json({success:true, message:"created successfully",data:option});
});

// @desc    Update an option
// route    PUT /api/options/:id
// access   private/admin
const updateOption = asyncHandler(async (req, res) => {
  const { name, route} = req.body;

  const image = req.file;

  const option = await Option.findById(req.params.id);

    let uploaded;
  
    if (image) {
      const optimizedBuffer = await sharp(image.buffer)
        .webp({ quality: 80 })
        .toBuffer();
  
      uploaded = await uploadToCloudinary(optimizedBuffer, "options");
    }

  if (option) {
    option.name = name || option.name;
    option.route = route || option.route;
    option.image = uploaded?.secure_url || option.image;
    // option.delete_url = delete_url || option.delete_url;

    const updatedOption = await option.save();
    res.json({success:true, message:"Updated successfully", data:updatedOption});
  } else {
    res.status(404);
    throw new Error("Option not found");
  }
});

// @desc    Get products matching option name across product fields
// @route   GET /api/products/option/:optionName
// @access  Public
const getProductsByOptionName = asyncHandler(async (req, res) => {
  const { optionName } = req.params;

  if (!optionName) {
    res.status(400);
    throw new Error("Option name is required");
  }

  const regex = new RegExp(optionName, "i"); // case-insensitive

  // Get categories and options matching the name
  const [matchedCategories, matchedOptions] = await Promise.all([
    Category.find({ title: regex }, "_id"),
    Option.find({ name: regex }, "_id"),
  ]);

  const matchedCategoryIds = matchedCategories.map((cat) => cat._id);
  const matchedOptionIds = matchedOptions.map((opt) => opt._id);

  const products = await Product.find({
    $or: [
      { title: regex },
      { description: regex },
      { tags: regex },
      { category: { $in: matchedCategoryIds } },
      { option: { $in: matchedOptionIds } },
    ],
  })
    .populate("category", "title")
    .populate("option", "name route image");

  res.status(200).json({success:true, data:products});
});

// @desc    Delete an option
// route    DELETE /api/options/:id
// access   private/admin
const deleteOption = asyncHandler(async (req, res) => {

  const checkProductOfOption = await Product.find({option: req.params.id})
  if(checkProductOfOption.length > 0){
    res.status(200).json({
      success:false,
      message:"Product of this option is still present, cannot delete."
    })
    return
  }
  const checkOption = await Option.findById(req.params.id);
  if(!checkOption){
    res.status(400).json({
      success:false,
      message:"option not found"
    })
    return
  }
  const option = await Option.findByIdAndDelete(req.params.id);

  await deleteFile(checkOption.image)

  if (option) {
    res.json({success:true, message: "Option deleted"});
  } else {
    res.status(404);
    throw new Error("Option not found");
  }
});

module.exports = {
  getOptions,
  getOptionById,
  createOption,
  updateOption,
  deleteOption,
  getProductsByOptionName,
};
