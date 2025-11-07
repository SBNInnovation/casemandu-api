const asyncHandler = require('express-async-handler')
const Banner = require('../models/bannerModel.js')

// desc:    Get all banners
// route:   GET /api/banners
// access:  public

const getBanner = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort({ display: 1 })

  res.status(200).json(banners)
})

// desc:  Create a banner
// route: POST /api/banners
// access: private/admin

const createBanner = asyncHandler(async (req, res) => {
  const { display, image, link } = req.body

  const count = await Banner.countDocuments({})

  if (count >= 5) {
    res.status(400)
    throw new Error('Maximum number of banners reached')
  }

  const banner = new Banner({
    display,
    image,
    link,
  })

  await banner.save()

  if (banner) {
    res.status(201).json({
      _id: banner._id,
      image: banner.image,
      display: banner.display,
      link: banner.link,
    })
  } else {
    res.status(400)
    throw new Error('Invalid banner data')
  }
})

// desc:  Delete a banner
// route: DELETE /api/banners/:id
// access: private/admin

const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id)

  if (banner) {
    res.json({ message: 'Banner deleted' })
  } else {
    res.status(404)
    throw new Error('Banner not found')
  }
})

// desc:  Update a banner
// route: PUT /api/banners/:id
// access: private/admin

const updateBanner = asyncHandler(async (req, res) => {
  const { image, display, link } = req.body

  const banner = await Banner.findById(req.params.id)

  if (banner) {
    banner.image = image || banner.image
    banner.display = display || banner.display
    banner.link = link || banner.link

    const updatedBrand = await banner.save()
    res.json(updatedBrand)
  } else {
    res.status(404)
    throw new Error('Banner not found')
  }
})

module.exports = {
  getBanner,
  createBanner,
  deleteBanner,
  updateBanner,
}
