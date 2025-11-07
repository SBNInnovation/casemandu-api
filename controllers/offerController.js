const Category = require('../models/categoryModel')
const Offer = require('../models/offerModel')
const Model = require('../models/modelModel')
const Brand = require('../models/brandModel')
const asyncHandler = require('express-async-handler')
const createSLUG = require('../utils/createSLUG')

// desc:    Get all offers
// route:   GET /api/offers
// access:  public

const getOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({})
    .populate('category', 'title')
    .populate({
      path: 'models',
      populate: { path: 'brand', select: 'title' },
    })
    .sort({ createdAt: -1 })

  res.status(200).json(offers)
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
  const { title, image, category, description, price, discount, models } =
    req.body

  const offer = new Offer({
    title,
    slug: await createSLUG(Offer, title),
    image,
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
  const { title, image, category, description, price, discount, models } =
    req.body

  const offer = await Offer.findOne({ slug: req.params.slug })

  if (offer) {
    offer.title = title || offer.title
    offer.slug = (title && (await createSLUG(Offer, title))) || offer.slug
    offer.image = image || offer.image
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
  res.json({ message: 'Offer deleted' })
})

module.exports = {
  getOffers,
  getOfferBySlug,
  createOffer,
  updateOffer,
  deleteOffer,
}
