const asyncHandler = require('express-async-handler')
const Category = require('../models/categoryModel.js')
const Product = require("../models/productModel.js")
const slugify = require("slugify");
const { uploadToCloudinary, deleteFile } = require('../utils/cloudinary.js');
const sharp = require("sharp")

// @desc    Get all category
// route    GET /api/categories
// access   public
// const getCategory = asyncHandler(async (req, res) => {
//   const category = await Category.find({}).sort({ createdAt: -1 })
//   const categoryIds = category.map(id => id._id)
//   console.log(categoryIds)
//   const getCountProductsOfCategory = await Product.countDocuments({categories})

//   res.status(200).json({
//     success:true,
//     data:category
//   })
// })

const getCategory = asyncHandler(async (req, res) => {
  // Fetch all categories
  const categories = await Category.find({}).sort({ createdAt: -1 });

  // Map each category with its product count
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const productCount = await Product.countDocuments({ category: cat._id });
      return {
        _id: cat._id,
        title: cat.title,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        productCount, 
      };
    })
  );

  res.status(200).json({
    success: true,
    data: categoriesWithCounts,
  });
});



// @desc   Get category by id
// route   GET /api/categories/:id
// access  public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)

  if (category) {
    res.status(200).json({
      success:true,
      message:"category",
      data:category
    })
  } else {
    res.status(404)
    throw new Error('Category not found')
  }
})

// @desc  Get all parent category
// route  GET /api/categories/parent
// access public
// const getParentCategory = asyncHandler(async (req, res) => {
//   const category = await Category.find({ parentCategory: null })

//   res.status(200).json(category)
// })

// @desc  Get all sub category of a parent category
// route  GET /api/categories/sub/:id
// access public
// const getSubCategoryByParentId = asyncHandler(async (req, res) => {
//   const category = await Category.find({
//     parentCategory: req.params.id,
//   })

//   res.status(200).json(category)
// })

// @desc    Insert category
// route    POST /api/categories
// access   private/admin

const createCategory = asyncHandler(async (req, res) => {
  const { title, description} = req.body;

  const image = req.file;

  // Basic validation
  // if (!title || !description) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Title and description are required.",
  //   });
  // }

  if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload the photo." });
    }
  
    // Compress + convert to webp
    const optimizedBuffer = await sharp(image.buffer)
      .webp({ quality: 80 })
      .toBuffer();
  
    const base64Data = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
  
    // Upload to Cloudinary
    const uploaded = await uploadToCloudinary(
      base64Data,
      "options"
    );

  // Check existing category (case-insensitive)
  const existingCategory = await Category.findOne({
    title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
  });

  if (existingCategory) {
    return res.status(409).json({
      success: false,
      message: "A category with this name already exists.",
    });
  }
  slug1 = slugify(title, { lower: true, strict: true })
  // Create new category
  const category = await Category.create({
    title: title.trim(),
    slug:slug1,
    description,
    image:uploaded?.secure_url,
    // delete_url
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully.",
    data: category,
  });
});

// @desc  Delete category
// route  DELETE /api/categories/:id
// access private/admin
const deleteCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;

   // Check if any product uses this category
  const productsUsingCategory = await Product.find({ category: id });
  if (productsUsingCategory.length > 0) {
    return res.status(200).json({
      success: false,
      message: "Category is used in products and cannot be deleted",
    });
  }

  const findCategory = await Category.findById(id)
  if(!findCategory){
    res.status(404).json({
      success:false,
      message:"Categories not found"
    })
    return
  }
  const category = await Category.findByIdAndDelete(id)

  await deleteFile(findCategory.image)

  if (category) {
    res.json({success:true, message: 'Category deleted', data: findCategory.delete_url })
  } else {
    res.status(404)
    throw new Error('Category not found')
  }
})

// @desc  Update category
// route  PUT /api/categories/:id
// access private/admin

const updateCategory = asyncHandler(async (req, res) => {
  const { title, description } = req.body

  const image = req.file;

  // console.log(image,"img")

  const category = await Category.findById(req.params.id)
  const slug1 = title ? slugify(title) : category.slug;

   let uploaded, base64Data;
    
      if (image) {
        const optimizedBuffer = await sharp(image.buffer)
          .webp({ quality: 80 })
          .toBuffer();
    
        base64Data = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
    
        uploaded = await uploadToCloudinary(base64Data, "products");
      }
  
  if (category) {
    category.title = title || category.title
    category.slug = slug1
    category.description = description || category.description
    category.image = uploaded?.secure_url || category.image
    // console.log(uploaded.secure_url)
    // category.delete_url = delete_url || category.delete_url

    const updatedCategory = await category.save()
    res.json({
      success:true,
      message:"Updated successfully",
      data:updatedCategory
    })

  } else {
    res.status(404)
    throw new Error('Category not found')
  }
})

module.exports = {
  getCategory,
  getCategoryById,
  // getParentCategory,
  // getSubCategoryByParentId,
  createCategory,
  deleteCategory,
  updateCategory,
}
