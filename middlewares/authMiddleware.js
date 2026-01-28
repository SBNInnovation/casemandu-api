const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel.js");

// const protect = asyncHandler(async (req, res, next) => {
//   let token

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       token = req.headers.authorization.split(' ')[1]

//       const decoded = jwt.verify(token, process.env.JWT_SECRET)

//       req.user = await UserModel.findById(decoded.id)

//       next()
//     } catch (error) {
//       res.status(401)
//       throw new Error('Not Authorized, token failed')
//     }
//   }

//   if (!token) {
//     res.status(401)
//     throw new Error('Not Authorized, no token')
//   }
// })

// const protect = asyncHandler(async (req, res, next) => {
//   // ✅ Allow preflight requests
//   if (req.method === "OPTIONS") {
//     return next();
//   }

//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await UserModel.findById(decoded.id);

//       return next();
//     } catch (error) {
//       res.status(401);
//       throw new Error("Not Authorized, token failed");
//     }
//   }

//   res.status(401);
//   throw new Error("Not Authorized, no token");
// });

const protect = asyncHandler(async (req, res, next) => {
  // ✅ Allow preflight
  if (req.method === "OPTIONS") return next();

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Not authorized, token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalid or expired",
    });
  }
});

const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not Authorized as an admin");
  }
});

module.exports = { protect, admin };
