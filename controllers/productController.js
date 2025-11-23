const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Option = require("../models/optionModels"); // Import Option model
const asyncHandler = require("express-async-handler");
const createSLUG = require("../utils/createSLUG");
const sharp = require("sharp");
const { uploadToCloudinary, deleteFile } = require("../utils/cloudinary");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
// const getProducts = asyncHandler(async (req, res) => {
//   const keyword = req.query.keyword
//     ? {
//         title: {
//           $regex: req.query.keyword,
//           $options: "i",
//         },
//       }
//     : {};

//   const count = await Product.countDocuments({ ...keyword });

//   const pageSize = Number(req.query.pageSize) || count;
//   const page = Number(req.query.pageNumber) || 1;
//   const displayBy = req.query.displayBy || "createdAt";

//   let sortCriteria = {};
//   switch (displayBy) {
//     case "newArrival":
//       sortCriteria = { new: -1 };
//       break;
//     case "bestSeller":
//       sortCriteria = { saleCount: -1 };
//       break;
//     case "mostPopular":
//       sortCriteria = { totalViews: -1 };
//       break;
//     default:
//       sortCriteria = { createdAt: -1 };
//   }

//   const products = await Product.find({ ...keyword })
//     .populate("category", "title")
//     .populate("option", "name route image") // Populate option
//     .sort(sortCriteria)
//     .limit(pageSize)
//     .skip(pageSize * (page - 1));

//   res.status(200).json({ products, page, pages: Math.ceil(count / pageSize) });
// });

const getProductForAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const activation = req.query.activation?.toString();
    const status = req.query.status?.toString();
    const search = req.query.search?.toString();
    const categories = req.query.categories?.toString();
    const options = req.query.options?.toString();
    const sort = req.query.sort?.toString();

    const skip = (page - 1) * limit;
    let query = {};


    // 🔍 Search filter
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    //  Category filter
    if (categories) {
      query.category = categories;
    }

    // Option filter
    if (options) {
      query.option = options;
    }

    // Activation filter
    if (activation === "active") query.isActivate = true; 
    if (activation === "inactive") query.isActivate = false;

    // New product filter
    if (status === "new") {
      query.isNew = true;
    } else if (status === "old") {
      query.isNew = false;
    }

    // Sorting logic
    let sortQuery = {};
    switch (sort) {
      case "createdAtasc":
        sortQuery.createdAt = 1;
        break;
      case "createdAtdesc":
        sortQuery.createdAt = -1;
        break;
      case "asc":
        sortQuery.price = 1;
        break;
      case "desc":
        sortQuery.price = -1;
        break;
      default:
        sortQuery.createdAt = -1;
    }

    // Fetch filtered products
    const products = await Product.find(query).populate("category", "title -_id")
      .sort(sortQuery)
      .limit(limit)
      .skip(skip);

      if(products.length === 0){
        res.status(200).json({
          success:true,
          message:"No product found",
          data:{totalProducts:[]}
        })
      }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // 1st day of current month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // last day of month

    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - 1);

    // Get dashboard counters
    const [
      totalProducts,
      productsFound,
      totalActiveProd,
      totalInactiveProd,
      newThisMonth
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments(query),
      Product.countDocuments({ isActivate: true }),
      Product.countDocuments({ isActivate: false }),
      Product.countDocuments({createdAt: { $gte: startOfMonth, $lte: endOfMonth }})
    ]);


    return res.status(200).json({
      success: true,
      data: {
        totalProducts:products,
        pagination: {
          totalProducts,
          productsFound,
          totalActive: totalActiveProd,
          totalInactive: totalInactiveProd,
          newProduct: newThisMonth,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          limit,
        },
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
// const createProduct = asyncHandler(async (req,res) => {
//   const {
//     title,
//     image,
//     category,
//     optionId, // Optional
//     features,
//     description,
//     price,
//     discount,
//     // new: isNew,
//   } = req.body;

//   // Validate category
//   const categoryExists = await Category.findById(category);
//   if (!categoryExists) {
//     res.status(404);
//     throw new Error("Category not found");
//     return
//   }

//   let parsedFeatures;
//   if(features){
//     parsedFeatures = JSON.parse(features)
//     if(parsedFeatures && !Array.isArray(parsedFeatures)){
//       res.status(404).json({
//         success:false,
//         message:"features must be an array"
//       })
//       return
//     }
//   }

//   // Validate option (optional)
//   let optionExists = null;
//   if (optionId) {
//     optionExists = await Option.findById(optionId);
//     if (!optionExists) {
//       res.status(404);
//       throw new Error("Option not found");
//     }
//     return
//   }

//   const now = new Date();

//   const product = await Product.create({
//     title,
//     slug: await createSLUG(Product, title),
//     image,
//     category,
//     option: optionId || undefined,
//     features: parsedFeatures,
//     description,
//     price,
//     discount,
//     createdAt: now,
//     updatedAt: now,
//   });
//   // await product.save();
//   // console.log(product);


// const productObj = product.toObject(); // ensures timestamps are included

// return res.status(201).json({
//   _id: productObj._id,
//   slug: productObj.slug,
//   title: productObj.title,
//   image: productObj.image,
//   category: productObj.category,
//   option: productObj.option,
//   features: productObj.features,
//   description: productObj.description,
//   tags: productObj.tags,
//   price: productObj.price,
//   discount: productObj.discount,
//   createdAt: productObj.createdAt,
//   updatedAt: productObj.updatedAt,
// });
// });

const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    optionId,
    features,
    description,
    price,
    discount,
  } = req.body;

  const image = req.file;
  // console.log(req.file)

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
    "products"
  );
  // const uploaded = { secure_url: "https://via.placeholder.com/150" };

  // Validate category
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Validate features (optional)
  let parsedFeatures = undefined;
  if (features) {
    try {
      parsedFeatures = JSON.parse(features);

      if (!Array.isArray(parsedFeatures)) {
        return res.status(400).json({
          success: false,
          message: "Features must be an array",
        });
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format for features",
      });
    }
  }

  // Validate optionId (optional)
  if (optionId) {
    const optionExists = await Option.findById(optionId);
    if (!optionExists) {
      res.status(404);
      throw new Error("Option not found");
    }
  }

  // Save product
  const addProduct = await Product.create({
    title,
    slug: await createSLUG(Product, title),
    image: uploaded.secure_url,
    category,
    option: optionId,
    features: parsedFeatures,
    description,
    price,
    discount,
  });

  if (!addProduct) {
    return res.status(500).json({
      success: false,
      message: "Unable to create product",
    });
  }

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: addProduct.toObject(),
  });
});

// @desc    Update a product
// @route   PUT /api/products/:slug
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    tags,
    optionId,
    features,
    description,
    price,
    discount,
  } = req.body;

  const image = req.file;

  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let uploaded, base64Data;

  if (image) {
    const optimizedBuffer = await sharp(image.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    base64Data = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;

    uploaded = await uploadToCloudinary(base64Data, "products");
  }

  let parsedFeatures;
  if (features) {
    parsedFeatures = JSON.parse(features);

    if (!Array.isArray(parsedFeatures)) {
      return res.status(400).json({
        success: false,
        message: "features must be an array",
      });
    }
  }

  // ✔ Option check
  if (optionId) {
    const optionExists = await Option.findById(optionId);
    if (!optionExists) {
      res.status(404);
      throw new Error("Option not found");
    }
    product.option = optionId;
  }

  product.title = title || product.title;
  product.slug =
    (title && (await createSLUG(Product, title))) || product.slug;
  product.image = uploaded?.secure_url || product.image;

  product.category = category || product.category;
  product.tags = tags || product.tags;
  product.features = parsedFeatures || product.features;
  product.description = description || product.description;
  product.price = price || product.price;
  product.discount = discount || product.discount;

  const updatedProduct = await product.save();

  res.status(201).json({
    _id: updatedProduct._id,
    title: updatedProduct.title,
    slug: updatedProduct.slug,
    image: updatedProduct.image,
    category: updatedProduct.category,
    option: updatedProduct.option,
    tags: updatedProduct.tags,
    features: updatedProduct.features,
    description: updatedProduct.description,
    price: updatedProduct.price,
    discount: updatedProduct.discount,
    createdAt: updatedProduct.createdAt,
    updatedAt: updatedProduct.updatedAt,
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

  await deleteFile(product.image)

  await product.deleteOne();

  res.json({ message: "Product deleted" });
});


const changeActivation = async (req, res) => {
  try {
    const { id } = req.query;
    const { activation } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product Id is required",
      });
    }

    // validation
    if (activation !== "active" && activation !== "inactive") {
      return res.status(400).json({
        success: false,
        message: "Invalid activation value. Use 'active' or 'inactive'.",
      });
    }

    const isActivate = activation === "active";

    const updated = await Product.findByIdAndUpdate(
      id,
      { isActivate },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isActivate ? "Activated" : "Deactivated",
      data: updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changeNewStatus = async(req,res) =>{
 try {
    const {id} = req.query;
    const {status} = req.body;

    if(!id){
      res.status({
        success:false,
        message:"Product Id is required"
      })
      return
    }

    if(status !== "new" && status !== "old"){
       { res.status(400).json({ success: false, message: "Invalid status value. Use 'new' or 'old'." });
                return;
        }      
    }

     if(status === "new"){
            const prd = await Product.findByIdAndUpdate(id,{isNew:true},{new:true});
            if(!prd){
                res.status(404).json({success:false, message:"Unable to update"})
                return
            }
            res.status(200).json({success:true, message:"Changed to new"});
        }else if(status === "old"){
            const prd = await Product.findByIdAndUpdate(id,{isNew:false},{new:true});
            if(!prd){
                res.status(404).json({success:false, message:"Unable to update"})
                return
            }
            res.status(200).json({success:true, message:"Changed to old"});
        }

  } catch (error) {
    if(error instanceof(Error)){
      res.status(500).json({
        success:false,
        message:error.message
      })
    }
  }
}

module.exports = {
  // getProducts,
  getProductsByCategory,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  changeActivation,
  changeNewStatus,
  getProductForAdmin,
  createProduct
};
