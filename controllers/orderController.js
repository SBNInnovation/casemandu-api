const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const PromocodeModel = require("../models/promocodeModel");
const nodemailer = require("nodemailer");
const { compressAndUpload } = require("../utils/compressAndUpload");
const { deleteFile } = require("../utils/cloudinary");
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
//     paymentMethod,
//   } = req.body;

//   const paymentImage = req?.files?.paymentImage?.[0];
//   const customImage = req?.files?.customImage?.[0];

//   if (!paymentImage) {
//     return res.status(400).json({ message: "Payment image is required" });
//   }

//   // ---------- Safe JSON parsing ----------
//   const parseJSON = (value, fieldName) => {
//     if (typeof value === "string") {
//       try {
//         return JSON.parse(value);
//       } catch {
//         throw new Error(`Invalid JSON in ${fieldName}`);
//       }
//     }
//     return value;
//   };

//   let orderItems, priceSummary, customCaseCoordinates;

//   try {
//     orderItems = parseJSON(req.body.orderItems, "orderItems");
//     priceSummary = parseJSON(req.body.priceSummary, "priceSummary");
//     customCaseCoordinates = parseJSON(
//       req.body.customCaseCoordinates,
//       "customCaseCoordinates"
//     );
//   } catch (err) {
//     return res.status(400).json({ message: err.message });
//   }

//   // ---------- Validation ----------
//   if (!orderItems?.length || !priceSummary) {
//     return res
//       .status(400)
//       .json({ message: "Order items or price summary missing" });
//   }

//   if (!name || !phone || !email || !city || !shippingAddress || !paymentMethod) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   // ---------- Parallel uploads ----------
//   const uploadTasks = [
//     compressAndUpload(paymentImage.buffer, "paymentImage"),
//   ];

//   if (customImage) {
//     uploadTasks.push(
//       compressAndUpload(customImage.buffer, "customImage")
//     );
//   }

//   const [uploadedPayment, uploadedCustom] = await Promise.all(uploadTasks);

//   // ---------- Parallel DB reads ----------
//   const promoDoc = priceSummary?.promoCode
//   ? await PromocodeModel.findOne({
//       code: priceSummary.promoCode,
//       isActive: true,
//     })
//   : null;

//   if (priceSummary?.promoCode && !promoDoc) {
//     return res.status(400).json({ message: "Invalid promo code" });
//   }

//   // ---------- Price calculation ----------
//   if (promoDoc) {
//     const discount =
//       (priceSummary.total * promoDoc.discount) / 100;

//     priceSummary.discountAmount =
//       discount > promoDoc.maxAmount ? promoDoc.maxAmount : discount;

//     priceSummary.grandTotal =
//       priceSummary.total -
//       priceSummary.discountAmount +
//       priceSummary.deliveryCharge;
//   } else {
//     priceSummary.discountAmount = 0;
//     priceSummary.grandTotal =
//       priceSummary.total + priceSummary.deliveryCharge;
//   }

//   // ---------- Generate order ID (existing logic) ----------
//   const order_id = `ORD-${Date.now()}`;

//   // ---------- Create order ----------
//   const newOrder = new Order({
//     order_id,
//     name,
//     phone,
//     email,
//     city,
//     shippingAddress,
//     additionalInfo,
//     paymentMethod,
//     orderItems,
//     paymentImage: uploadedPayment?.secure_url,
//     customImage: uploadedCustom?.secure_url || null,
//     customCaseCoordinates,
//     priceSummary,
//   });

//   const createdOrder = await newOrder.save();

//   // ---------- Respond immediately ----------
//   res.status(201).json({
//     message: "Order placed successfully",
//     order_id: createdOrder.order_id,
//     data: createdOrder
//   });

//   // ---------- Non-blocking socket emit ----------
//   setImmediate(async () => {
//     try {
//       const pendingOrdersCount = await Order.countDocuments({
//         status: "Pending",
//       });

//       const io = req.app.get("io");

//       io.to("admins").emit("new-order", {
//         order: {
//           _id: createdOrder._id,
//           order_id: createdOrder.order_id,
//           status: createdOrder.status,
//           createdAt: createdOrder.createdAt,
//           name: createdOrder.name,
//           phone: createdOrder.phone,
//           city: createdOrder.city,
//           orderItems: createdOrder.orderItems,
//           paymentMethod: createdOrder.paymentMethod,
//           paymentImage: createdOrder.paymentImage,
//           priceSummary: createdOrder.priceSummary,
//         },
//         pendingOrders: pendingOrdersCount,
//       });
//     } catch (err) {
//       console.error("Socket emit failed:", err.message);
//     }
//   });
//   if (createdOrder) {
//   setImmediate(async () => {
//     try {
//       await createEmailTest({
//         body: {
//           customerEmail: createdOrder.email,
//           name: createdOrder.name,
//           orderId: `Order Id: ${createdOrder.order_id}`,
//           TotalPrice: `Total Price: ${createdOrder.priceSummary.grandTotal}`,
//           TrackingUrl: `https://casemandu.com.np/order/${createdOrder._id}`,
//         },
//       });
//     } catch (err) {
//       console.error("Email send failed:", err.message);
//     }
//   });
// }
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

  const isCustomOrder = req.body.isCustomOrder === "true";

  const paymentImage = req?.files?.paymentImage?.[0];

  const customImage = Array.isArray(req.files?.customImage)
    ? req.files.customImage
    : [];

  if (!paymentImage) {
    return res
      .status(400)
      .json({ success: false, message: "Payment image is required" });
  }

  // ---------- Safe JSON parsing ----------
  const parseJSON = (value, fieldName) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        throw new Error(`Invalid JSON in ${fieldName}`);
      }
    }
    return value;
  };

  let orderItems, priceSummary;

  try {
    orderItems = parseJSON(req.body.orderItems, "orderItems");
    priceSummary = parseJSON(req.body.priceSummary, "priceSummary");
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  // ---------- Validation ----------
  if (!orderItems?.length || !priceSummary) {
    return res
      .status(400)
      .json({ message: "Order items or price summary missing" });
  }

  if (
    !name ||
    !phone ||
    !email ||
    !city ||
    !shippingAddress ||
    !paymentMethod
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // ---------- Custom order validation BEFORE upload ----------
  if (isCustomOrder) {
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Custom order items missing",
      });
    }

    if (customImage.length !== orderItems.length) {
      return res.status(400).json({
        success: false,
        message: "Each custom item must have exactly one image",
      });
    }
  }

  // ---------- Parallel uploads ----------
  const paymentUpload = compressAndUpload(paymentImage.buffer, "paymentImage");

  const customUploads =
    customImage.length > 0
      ? customImage.map((file) => compressAndUpload(file.buffer, "customImage"))
      : [];

  const [uploadedPayment, ...uploadedCustomImage] = await Promise.all([
    paymentUpload,
    ...customUploads,
  ]);

  try {
    orderItems = orderItems.map((item, index) => {
      if (isCustomOrder) {
        if (!uploadedCustomImage[index]) {
          throw new Error(`Custom image missing for item ${index}`);
        }

        return {
          ...item,
          isCustom: true,
          customImage: uploadedCustomImage[index].secure_url,
        };
      }

      return {
        ...item,
        isCustom: false,
        customImage: null,
      };
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // ---------- Parallel DB reads ----------
  const promoDoc = priceSummary?.promoCode
    ? await PromocodeModel.findOne({
        code: priceSummary.promoCode,
        isActive: true,
      })
    : null;

  if (priceSummary?.promoCode && !promoDoc) {
    return res.status(400).json({ message: "Invalid promo code" });
  }

  // ---------- Price calculation ----------
  if (promoDoc) {
    const discount = (priceSummary.total * promoDoc.discount) / 100;

    priceSummary.discountAmount =
      discount > promoDoc.maxAmount ? promoDoc.maxAmount : discount;

    priceSummary.grandTotal =
      priceSummary.total -
      priceSummary.discountAmount +
      priceSummary.deliveryCharge;
  } else {
    priceSummary.discountAmount = 0;
    priceSummary.grandTotal = priceSummary.total + priceSummary.deliveryCharge;
  }

  // ---------- Generate order ID (existing logic) ----------
  const order_id = `ORD-${Date.now()}`;

  // ---------- Create order ----------
  const newOrder = new Order({
    order_id,
    name,
    phone,
    email,
    city,
    shippingAddress,
    additionalInfo,
    paymentMethod,
    orderItems,
    paymentImage: uploadedPayment.secure_url,
    priceSummary,
  });

  const createdOrder = await newOrder.save();

  // ---------- Respond immediately ----------
  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order_id: createdOrder.order_id,
    data: createdOrder,
  });

  // ---------- Non-blocking socket emit ----------
  setImmediate(async () => {
    try {
      const pendingOrdersCount = await Order.countDocuments({
        status: "Pending",
      });

      const io = req.app.get("io");

      io.to("admins").emit("new-order", {
        order: {
          _id: createdOrder._id,
          order_id: createdOrder.order_id,
          status: createdOrder.status,
          createdAt: createdOrder.createdAt,
          name: createdOrder.name,
          phone: createdOrder.phone,
          city: createdOrder.city,
          orderItems: createdOrder.orderItems,
          paymentMethod: createdOrder.paymentMethod,
          paymentImage: createdOrder.paymentImage,
          priceSummary: createdOrder.priceSummary,
        },
        pendingOrders: pendingOrdersCount,
      });
    } catch (err) {
      console.error("Socket emit failed:", err.message);
    }
  });
  if (createdOrder) {
    setImmediate(async () => {
      try {
        await createEmailTest({
          body: {
            customerEmail: createdOrder.email,
            name: createdOrder.name,
            orderId: `Order Id: ${createdOrder.order_id}`,
            TotalPrice: `Total Price: ${createdOrder.priceSummary.grandTotal}`,
            TrackingUrl: `https://casemandu.com.np/order/${createdOrder._id}`,
          },
        });
      } catch (err) {
        console.error("Email send failed:", err.message);
      }
    });
  }
});

async function createEmailTest({ body }) {
  const { customerEmail, orderId, TotalPrice, TrackingUrl, name } = body;

  if (!customerEmail || !orderId || !TotalPrice) {
    throw new Error("Missing email fields");
  }

  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });

  const transporter = nodemailer.createTransport({
    service: "gmail", // Or your email provider
    auth: {
      user: "manducase@gmail.com",
      pass: "urll npjn gqny mpqe", // For Gmail, this is an "App Password", not your regular password
    },
  });

  if (!customerEmail || !orderId || !TotalPrice) {
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
          ${orderId}
          ${TotalPrice}
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

const deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;

    // ---------- Check if order exists ----------
    const checkOrd = await Order.findById(id);
    if (!checkOrd) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ---------- Delete payment image from storage ----------
    if (checkOrd.paymentImage) {
      await deleteFile(checkOrd.paymentImage); // make sure deleteFile handles missing files
    }

    // ---------- Delete custom images if any ----------
    if (checkOrd.orderItems && checkOrd.orderItems.length > 0) {
      for (const item of checkOrd.orderItems) {
        if (item.isCustom && item.customImage) {
          await deleteFile(item.customImage);
        }
      }
    }

    // ---------- Delete the order ----------
    await Order.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

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
  deleteOrder,
};
