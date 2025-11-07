const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const generateTOKEN = require('../utils/generateTOKEN')

// @desc  Register a new user
// @route POST /api/users
// @access Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, image } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(401)
    throw new Error('Email already registered.')
  }
  const user = await User.create({ name, email, password, image })

  if (!user) {
    res.status(400)
    throw new Error('Invalid user data.')
  }

  res.status(201).json({
    message: 'User registered successfully.',
  })
})

// @desc  Auth user & get token
// @route POST /api/users/login
// @access Public

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')

  if (user && (await user.matchPassword(password))) {
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      image: user.image,
      token: generateTOKEN(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid Credentials')
  }
})

module.exports = { registerUser, authUser }
