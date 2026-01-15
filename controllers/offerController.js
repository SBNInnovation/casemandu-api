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
      { title: { $regex: search, $options: "i" }},
      {description:{$regex:search, $options:"i"}}
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
    // .populate('models', 'title')

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
    
      // Upload to Cloudinary
      const uploaded = await uploadToCloudinary(
        optimizedBuffer,
        "offers"
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
  const { title, category, description, price, discount, models } = req.body
  const image = req.file

  const offer = await Offer.findOne({ slug: req.params.slug })

  if (!offer) {
    res.status(404)
    throw new Error('Offer not found')
  }

  let uploaded

  if (image) {
    const optimizedBuffer = await sharp(image.buffer)
      .webp({ quality: 80 })
      .toBuffer()

    uploaded = await uploadToCloudinary(optimizedBuffer, 'offers')
  }

  if (title) {
    offer.title = title
    offer.slug = await createSLUG(Offer, title)
  }

  if (category) offer.category = category
  if (description !== undefined) offer.description = description
  if (price !== undefined) offer.price = price
  if (discount !== undefined) offer.discount = discount
  if (models !== undefined) offer.models = models
  if (uploaded?.secure_url) offer.image = uploaded.secure_url

  const updatedOffer = await offer.save()

  res.status(200).json(updatedOffer)
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
