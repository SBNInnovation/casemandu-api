const asyncHandler = require('express-async-handler')
const Customer = require('../models/customerModel.js')

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
  const { image, link } = req.body

  const customer = new Customer({
    image,
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
  const customer = await Customer.findByIdAndDelete(req.params.id)

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
  const { image, link } = req.body

  const customer = await Customer.findById(req.params.id)

  if (customer) {
    customer.image = image || customer.image
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
