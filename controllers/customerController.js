const asyncHandler = require('express-async-handler')
const Customer = require('../models/customerModel.js')
const { uploadToCloudinary, deleteFile } = require('../utils/cloudinary.js')
const sharp = require("sharp")

// desc:    Get all customers
// route:   GET /api/customers
// access:  public

const getCustomer = asyncHandler(async (req, res) => {
  const customers = await Customer.find({}).sort({ createdAt: -1 })

  res.status(200).json(customers)
})

// desc:  Create a customer
// route: POST /api/customers
// access: private/admin

const createCustomer = asyncHandler(async (req, res) => {
  const { link } = req.body;

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
    
      // Upload to Cloudinary
      const uploaded = await uploadToCloudinary(
        optimizedBuffer,
        "options"
      );

  const customer = new Customer({
    image:uploaded?.secure_url,
    link,
  })

  await customer.save()

  if (customer) {
    res.status(201).json({
      _id: customer._id,
      image: customer.image,
      link: customer.link,
    })
  } else {
    res.status(400)
    throw new Error('Invalid customer data')
  }
})

// desc:  Delete a customer
// route: DELETE /api/customers/:id
// access: private/admin

const deleteCustomer = asyncHandler(async (req, res) => {
  const checkCustomer = await Customer.findById(req.params.id);
  if(!checkCustomer){
    res.status(400).json({
      success:false,
      message:"Customer not find"
    })
  }
  const customer = await Customer.findByIdAndDelete(req.params.id)
  await deleteFile(checkCustomer.image)

  if (customer) {
    res.json({ message: 'Customer deleted' })
  } else {
    res.status(404)
    throw new Error('Customer not found')
  }
})

// desc:  Update a customer
// route: PUT /api/customers/:id
// access: private/admin

const updateCustomer = asyncHandler(async (req, res) => {
  const { link } = req.body;
  const {image} = req.file


  const customer = await Customer.findById(req.params.id)

  let uploaded;
      
        if (image) {
          const optimizedBuffer = await sharp(image.buffer)
            .webp({ quality: 80 })
            .toBuffer();
      
          uploaded = await uploadToCloudinary(optimizedBuffer, "options");
        }

  if (customer) {
    customer.image = uploaded?.secure_url || customer.image
    customer.link = link || customer.link

    const updatedBrand = await customer.save()
    res.json(updatedBrand)
  } else {
    res.status(404)
    throw new Error('Customer not found')
  }
})

module.exports = {
  getCustomer,
  createCustomer,
  deleteCustomer,
  updateCustomer,
}
