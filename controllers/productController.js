const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Option = require("../models/optionModels"); // Import Option model
const asyncHandler = require("express-async-handler");
const createSLUG = require("../utils/createSLUG");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });

  const pageSize = Number(req.query.pageSize) || count;
  const page = Number(req.query.pageNumber) || 1;
  const displayBy = req.query.displayBy || "createdAt";

  let sortCriteria = {};
  switch (displayBy) {
    case "newArrival":
      sortCriteria = { new: -1 };
      break;
    case "bestSeller":
      sortCriteria = { saleCount: -1 };
      break;
    case "mostPopular":
      sortCriteria = { totalViews: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
  }

  const products = await Product.find({ ...keyword })
    .populate("category", "title")
    .populate("option", "name route image") // Populate option
    .sort(sortCriteria)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get all products by category
// @route   GET /api/products/category/:slug
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });

  if (category) {
    const count = await Product.countDocuments({ category: category._id });

    const pageSize = Number(req.query.pageSize) || count;
    const page = Number(req.query.pageNumber) || 1;

    const products = await Product.find({ category: category._id })
      .populate("category", "title")
      .populate("option", "name route image") // Populate option
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res
      .status(200)
      .json({ products, page, pages: Math.ceil(count / pageSize) });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Get product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate(
      "category",
      "title slug description price isCase extraField placeholder"
    )
    .populate("option", "name route image"); // Populate option

  if (product) {
    product.totalViews += 1;
    await product.save();

    res.status(200).json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    image,
    category,
    optionId, // Optional
    description,
    price,
    discount,
    new: isNew,
  } = req.body;

  // Validate category
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Validate option (optional)
  let optionExists = null;
  if (optionId) {
    optionExists = await Option.findById(optionId);
    if (!optionExists) {
      res.status(404);
      throw new Error("Option not found");
    }
  }

  const product = new Product({
    title,
    slug: await createSLUG(Product, title),
    image,
    category,
    option: optionId || undefined,
    description,
    price,
    discount,
    new: isNew,
  });

  await product.save();

  res.status(201).json({
    _id: product._id,
    slug: product.slug,
    title: product.title,
    image: product.image,
    category: product.category,
    option: product.option,
    description: product.description,
    tags: product.tags,
    price: product.price,
    discount: product.discount,
    new: product.new,
  });
});

// @desc    Update a product
// @route   PUT /api/products/:slug
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    title,
    image,
    category,
    tags,
    optionId, // Optional
    description,
    price,
    discount,
    new: isNew,
  } = req.body;

  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Option check (if provided)
  if (optionId) {
    const optionExists = await Option.findById(optionId);
    if (!optionExists) {
      res.status(404);
      throw new Error("Option not found");
    }
    product.option = optionId;
  }

  product.title = title || product.title;
  product.slug = (title && (await createSLUG(Product, title))) || product.slug;
  product.image = image || product.image;
  product.category = category || product.category;
  product.tags = tags || product.tags;
  product.description = description || product.description;
  product.price = price || product.price;
  product.discount = discount || product.discount;
  product.new = isNew || product.new;

  const updatedProduct = await product.save();

  res.status(201).json({
    _id: updatedProduct._id,
    title: updatedProduct.title,
    slug: updatedProduct.slug,
    image: updatedProduct.image,
    category: updatedProduct.category,
    option: updatedProduct.option,
    tags: updatedProduct.tags,
    description: updatedProduct.description,
    price: updatedProduct.price,
    discount: updatedProduct.discount,
    new: updatedProduct.new,
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:slug
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();

  res.json({ message: "Product deleted" });
});

module.exports = {
  getProducts,
  getProductsByCategory,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
