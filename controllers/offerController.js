const Category = require('../models/categoryModel')
const Offer = require('../models/offerModel')
const Model = require('../models/modelModel')
const Brand = require('../models/brandModel')
const asyncHandler = require('express-async-handler')
const createSLUG = require('../utils/createSLUG')
const { uploadToCloudinary, deleteFile } = require('../utils/cloudinary')
const sharp = require("sharp")

// desc:    Get all offers
// route:   GET /api/offers
// access:  public

const getOffers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const search = req.query.search?.toString();
  const categories = req.query.categories?.toString();

    const skip = (page - 1) * limit;

  let query = {};

  //  Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } }
    ];
  }

  //  Category filter (single category only)
  if (categories) {
    query.category = categories;
  }

  // For pagination
  const totalOffers = await Offer.countDocuments(query);

  const offers = await Offer.find(query)
    .populate("category", "title")
    .populate({
      path: "models",
      populate: { path: "brand", select: "title" },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    total: totalOffers,
    totalPages: Math.ceil(totalOffers / limit),
    data: offers,
  });
})

// desc:    Get a offer by slug
// route:   GET /api/offers/:slug
// access:  public

const getOfferBySlug = asyncHandler(async (req, res) => {
  // find offer by slug and populate category
  const offer = await Offer.findOne({ slug: req.params.slug })
    .populate('category', 'title')
    .populate('models', 'title')

  if (offer) {
    await offer.save()

    res.status(200).json(offer)
  } else {
    res.status(404)
    throw new Error('Offer not found')
  }
})

// desc:    Create a offer
// route:   POST /api/offers
// access:  private/admin

const createOffer = asyncHandler(async (req, res) => {
  const { title, category, description, price, discount, models } =
    req.body;

  const image = req.file;

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

  const offer = new Offer({
    title,
    slug: await createSLUG(Offer, title),
    image:uploaded?.secure_url,
    category,
    description,
    price,
    discount,
    models,
  })

  await offer.save()

  if (offer) {
    res.status(201).json({
      _id: offer._id,
      slug: offer.slug,
      title: offer.title,
      image: offer.image,
      category: offer.category,
      description: offer.description,
      price: offer.price,
      discount: offer.discount,
      models: offer.models,
    })
  } else {
    res.status(400)
    throw new Error('Invalid offer data')
  }
})

// desc:    Update a offer
// route:   PUT /api/offers/:slug
// access:  private/admin

const updateOffer = asyncHandler(async (req, res) => {
  const { title, category, description, price, discount, models } =
    req.body;

  const image = req.file;

  const offer = await Offer.findOne({ slug: req.params.slug })

   let uploaded, base64Data;
      
        if (image) {
          const optimizedBuffer = await sharp(image.buffer)
            .webp({ quality: 80 })
            .toBuffer();
      
          base64Data = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
      
          uploaded = await uploadToCloudinary(base64Data, "products");
        }

  if (offer) {
    offer.title = title || offer.title
    offer.slug = (title && (await createSLUG(Offer, title))) || offer.slug
    offer.image = uploaded?.secure_url || offer.image
    offer.category = category || offer.category
    offer.description = description || offer.description
    offer.price = price || offer.price
    offer.discount = discount || offer.discount
    offer.models = models || offer.models

    const updatedProduct = await offer.save()

    res.status(201).json({
      _id: updatedProduct._id,
      title: updatedProduct.title,
      slug: updatedProduct.slug,
      image: updatedProduct.image,
      category: updatedProduct.category,
      description: updatedProduct.description,
      price: updatedProduct.price,
      discount: updatedProduct.discount,
      models: updatedProduct.models,
    })
  }

  res.status(404)
  throw new Error('Offer not found')
})

// desc:    Delete a offer
// route:   DELETE /api/offers/:slug
// access:  private/admin

const deleteOffer = asyncHandler(async (req, res) => {
  const offerSlug = req.params.slug
  const offer = await Offer.findOne({ slug: offerSlug })

  if (!offer) {
    res.status(404)
    throw new Error('Offer not found')
  }

  await offer.deleteOne({ slug: offerSlug })
  await deleteFile(offer.image)
  res.json({ message: 'Offer deleted' })
})

module.exports = {
  getOffers,
  getOfferBySlug,
  createOffer,
  updateOffer,
  deleteOffer,
}
