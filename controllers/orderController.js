const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const PromocodeModel = require("../models/promocodeModel");
const nodemailer = require("nodemailer");
const { compressAndUpload } = require("../utils/compressAndUpload");
// @desc    Create new order
// @route   POST /api/orders
// @access  Public

// const addOrderItems = asyncHandler(async (req, res) => {
//   const {
//     name,
//     phone,
//     email,
//     city,
//     shippingAddress,
//     additionalInfo,
//     // orderItems,
//     paymentMethod,
//     // customCaseCoordinates,
//     // priceSummary,
//   } = req.body;

//   let orderItems = req.body.orderItems;
//   let priceSummary = req.body.priceSummary;
//   let customCaseCoordinates = req.body.customCaseCoordinates;

//   const paymentImage = req.files.paymentImage?.[0];
//   const customImage = req.files.customImage?.[0];

//   if (!paymentImage && !customImage) {
//     return res.status(400).json({ message: "At least payment image is required" });
//   }


//   if (typeof orderItems === "string") {
//     orderItems = JSON.parse(orderItems);
//   }

// // Only parse if it's a string
// if (typeof priceSummary === "string") {   
//   try {
//     priceSummary = JSON.parse(priceSummary);
//   } catch (err) {
//     return res.status(400).json({ message: "Invalid JSON in priceSummary" });
//   }
// }

//   if (typeof customCaseCoordinates === "string") {
//     customCaseCoordinates = JSON.parse(customCaseCoordinates);
//   }

//   if ((orderItems && orderItems.length === 0) || !priceSummary) {
//     console.log(orderItems, priceSummary);
//     res.status(400);
//     throw new Error("No order items");
//   }

//   if (
//     !name ||
//     !phone ||
//     !city ||
//     !shippingAddress ||
//     !paymentMethod
//   ) {
//     res.status(400);
//     throw new Error("All fields are required");
//   }

//   const uploaded = await compressAndUpload(paymentImage.buffer, "paymentImage");
//   const uploadedCustom = await compressAndUpload(customImage.buffer, "customImage");


//   if (priceSummary?.promoCode) {
//     const isValidPromoCode = await PromocodeModel.findOne({
//       code: priceSummary.promoCode,
//       isActive: true,
//     });

//     if (isValidPromoCode) {
//       const disAmount = (priceSummary.total * isValidPromoCode.discount) / 100;

//       priceSummary.discountAmount =
//         disAmount > isValidPromoCode.maxAmount
//           ? isValidPromoCode.maxAmount
//           : disAmount;

//       priceSummary.grandTotal =
//         priceSummary.total -
//         priceSummary.discountAmount +
//         priceSummary.deliveryCharge;
//     } else {
//       res.status(400);
//       throw new Error("Invalid promo code");
//     }
//   } else {
//     priceSummary.discountAmount = 0;
//     priceSummary.grandTotal = priceSummary.total + priceSummary.deliveryCharge;
//   }

//   const lastOrder = await Order.findOne().sort({ createdAt: -1 });
//   let order_id;
//   if (!lastOrder) {
//     order_id = 1000;
//   } else {
//     order_id = lastOrder.order_id + 1;
//   }

//   const order = new Order({
//     order_id,
//     name,
//     orderItems,
//     shippingAddress,
//     city,
//     phone,
//     email,
//     additionalInfo,
//     paymentMethod,
//     paymentImage:uploaded?.secure_url,
//     customImage:uploadedCustom?.secure_url,
//     customCaseCoordinates,
//     priceSummary,
//   });

//   const createdOrder = await order.save();
//   if (createdOrder) {
//     const emailSent = await createEmailTest({
//       body: {
//         customerEmail: createdOrder.email,
//         name: createdOrder.name,
//         orderDetails: `Order ID: ${createdOrder.order_id}, Total Price: ${createdOrder.priceSummary.grandTotal}`,
//         TrackingUrl: `https://casemandu.com.np/order/${createdOrder._id}`,
//       },
//     });

//     if (!emailSent) {
//       console.error("Failed to send order confirmation email.");
//     }
//   }

//   res.status(201).json(createdOrder);
// });

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    email,
    city,
    shippingAddress,
    additionalInfo,
    paymentMethod,
  } = req.body;

  const paymentImage = req?.files?.paymentImage?.[0];
  const customImage = req?.files?.customImage?.[0];

  if (!paymentImage) {
    return res.status(400).json({ message: "Payment image is required" });
  }

  // Parse JSON fields safely
  let orderItems = req.body.orderItems;
  let priceSummary = req.body.priceSummary;
  let customCaseCoordinates = req.body.customCaseCoordinates;

  // Safe JSON parsing utility
  const parseJSON = (value, fieldName) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (err) {
        throw new Error(`Invalid JSON in ${fieldName}`);
      }
    }
    return value;
  };

  try {
    orderItems = parseJSON(orderItems, "orderItems");
    priceSummary = parseJSON(priceSummary, "priceSummary");
    customCaseCoordinates = parseJSON(customCaseCoordinates, "customCaseCoordinates");
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  // Validate required fields
  if (!orderItems || orderItems.length === 0 || !priceSummary) {
    return res.status(400).json({ message: "No order items or price summary missing" });
  }

  if (!name || !phone || !email ||!city || !shippingAddress || !paymentMethod) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Upload required images
  const uploadedPayment = await compressAndUpload(paymentImage.buffer, "paymentImage");

  // Upload custom image (optional)
  let uploadedCustom = null;
  if (customImage) {
    uploadedCustom = await compressAndUpload(customImage.buffer, "customImage");
  }

  // Apply promo code
  if (priceSummary?.promoCode) {
    const isValidPromoCode = await PromocodeModel.findOne({
      code: priceSummary.promoCode,
      isActive: true,
    });

    if (!isValidPromoCode) {
      return res.status(400).json({ message: "Invalid promo code" });
    }

    const discountAmount =
      (priceSummary.total * isValidPromoCode.discount) / 100;

    priceSummary.discountAmount =
      discountAmount > isValidPromoCode.maxAmount
        ? isValidPromoCode.maxAmount
        : discountAmount;

    priceSummary.grandTotal =
      priceSummary.total -
      priceSummary.discountAmount +
      priceSummary.deliveryCharge;
  } else {
    priceSummary.discountAmount = 0;
    priceSummary.grandTotal =
      priceSummary.total + priceSummary.deliveryCharge;
  }

  // Generate incremental order ID
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  const order_id = lastOrder ? lastOrder.order_id + 1 : 1000;

  // Create order
  const newOrder = new Order({
    order_id,
    name,
    orderItems,
    shippingAddress,
    city,
    phone,
    email,
    additionalInfo,
    paymentMethod,
    paymentImage: uploadedPayment?.secure_url,
    customImage: uploadedCustom?.secure_url || null,
    customCaseCoordinates,
    priceSummary,
  });

  const createdOrder = await newOrder.save();


  const io = req.app.get("io");

  // emit to admin room only
  io.to("admins").emit("new-order", {
    _id: createdOrder._id,

    // Order identification
    order_id: createdOrder.order_id,
    status: createdOrder.status,
    orderedAt: createdOrder.orderedAt,
    createdAt: createdOrder.createdAt,
    updatedAt: createdOrder.updatedAt,

    // Customer details
    name: createdOrder.name,
    phone: createdOrder.phone,
    email: createdOrder.email,
    city: createdOrder.city,
    shippingAddress: createdOrder.shippingAddress,
    additionalInfo: createdOrder.additionalInfo,

    // Order items
    orderItems: createdOrder.orderItems.map((item) => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      image: item.image,
      variant: item.variant,
    })),

    // Custom case info
    customImage: createdOrder.customImage,
    customCaseCoordinates: createdOrder.customCaseCoordinates,

    // Payment info
    paymentMethod: createdOrder.paymentMethod,
    paymentImage: createdOrder.paymentImage,

    // Pricing
    priceSummary: {
      promoCode: createdOrder.priceSummary.promoCode,
      total: createdOrder.priceSummary.total,
      discountAmount: createdOrder.priceSummary.discountAmount,
      deliveryCharge: createdOrder.priceSummary.deliveryCharge,
      grandTotal: createdOrder.priceSummary.grandTotal,
    },

    // Shipping
    shippedAt: createdOrder.shippedAt,
  });


  if (createdOrder) {
    const emailSent = await createEmailTest({
      body: {
        customerEmail: createdOrder.email,
        name: createdOrder.name,
        orderDetails: `Order ID: ${createdOrder.order_id}, Total Price: ${createdOrder.priceSummary.grandTotal}`,
        TrackingUrl: `https://casemandu.com.np/order/${createdOrder._id}`,
      },
    });

    if (!emailSent) {
      console.error("Failed to send order confirmation email.");
    }
  }

  res.status(201).json(createdOrder);
});

async function createEmailTest({ body }) {
  const { customerEmail, orderDetails, TrackingUrl, name } = body;

  const transporter = nodemailer.createTransport({
    service: "gmail", // Or your email provider
    auth: {
      user: "manducase@gmail.com",
      pass: "zlcs xlgm xkjl nqzf", // For Gmail, this is an "App Password", not your regular password
    },
  });

  if (!customerEmail || !orderDetails) {
    return res
      .status(400)
      .json({ message: "customerEmail and orderDetails are required." });
  }

  const mailOptions = {
    from: "No-reply@casemandu.com.np <no-reply@casemandu.com.np>",
    to: customerEmail,
    subject: "Your Order from Casemandu!",
   html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background: #f5f7fa;
        margin: 0;
        padding: 0;
        color: #444;
      }

      .container {
        background: #ffffff;
        max-width: 650px;
        margin: 40px auto;
        padding: 0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      }

      /* Header */
      .header {
        background: linear-gradient(135deg, #d9230f, #a6190c);
        color: #fff;
        padding: 35px 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      /* Content Section */
      .content {
        padding: 30px 30px;
        font-size: 16px;
        line-height: 1.7;
      }

      .order-box {
        background: #f8f8f8;
        border-left: 4px solid #d9230f;
        padding: 18px;
        border-radius: 8px;
        margin: 25px 0;
        font-size: 15px;
        font-family: monospace;
        white-space: pre-wrap;
      }

      /* Button */
      .btn {
        display: inline-block;
        background: #d9230f;
        padding: 14px 26px;
        color: #fff !important;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        text-decoration: none;
        margin-top: 10px;
        transition: 0.3s ease;
      }
      .btn:hover {
        background: #b71b0c;
      }

      /* Footer */
      .footer {
        text-align: center;
        font-size: 13px;
        color: #777;
        padding: 18px;
        border-top: 1px solid #eee;
        background: #fafafa;
      }
      .footer a {
        color: #d9230f;
        text-decoration: none;
      }

      @media only screen and (max-width: 600px) {
        .content {
          padding: 20px;
        }
        .header h1 {
          font-size: 22px;
        }
      }
    </style>
  </head>

  <body>
    <div class="container">

      <div class="header">
        <h1>Thank You for Your Order!</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your order has been successfully completed. We’re preparing everything and will get it to you as soon as possible.</p>

        <div class="order-box">
          <strong>Order Details:</strong><br/>
          ${orderDetails}
        </div>

        <p>
          <strong>Track your order here:</strong><br/>
          <a href="${TrackingUrl}" class="btn">Track Your Order</a>
        </p>

        <p>We truly appreciate your trust in <strong>Casemandu</strong>. You're awesome! ❤️</p>
      </div>

      <div class="footer">
        &copy; ${new Date().getFullYear()} Casemandu. All rights reserved.<br/>
      </div>
    </div>
  </body>
  </html>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private/Admin

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/delivered
// @access  Private/Admin

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc   Update order status
// @route  PUT /api/orders/:id/status
// @access Private/Admin

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status;

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const deleteOrder = async(req,res) =>{
  try {
    const id =  req.params.id;
    const deleteOrd = await Order.findByIdAndDelete(id);
    if(!deleteOrd){
      res.status(400).json({
        success:false,
        message:"Unable to delete"
      })
      return
    }
    res.status(200).json({
      success:true,
      message:"Deleted successfully"
    })

  } catch (error) {
    if(error instanceof(Error)){
      res.status(500).json({
        success:false,
        message:error.message
      })
    }
  }
} 

// @desc Track order
// @route GET /api/orders/track/:id
// @access Private

const trackOrder = asyncHandler(async (req, res) => {
  const order_id = req.query.id;
  const phone = req.query.ph;

  const order = await Order.findOne({ order_id, phone });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.status(200).json({
    _id: order._id,
  });
});

module.exports = {
  addOrderItems,
  getOrders,
  getOrderById,
  updateOrderToDelivered,
  updateOrderStatus,
  trackOrder,
  deleteOrder
};
