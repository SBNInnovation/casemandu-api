const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const PromocodeModel = require("../models/promocodeModel");
const nodemailer = require("nodemailer");
// @desc    Create new order
// @route   POST /api/orders
// @access  Public

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    email,
    city,
    shippingAddress,
    additionalInfo,
    orderItems,
    paymentMethod,
    paymentImage,
    customImage,
    customCaseCoordinates,
    priceSummary,
  } = req.body;

  if ((orderItems && orderItems.length === 0) || !priceSummary) {
    console.log(orderItems, priceSummary);
    res.status(400);
    throw new Error("No order items");
  }

  if (
    !name ||
    !phone ||
    !city ||
    !shippingAddress ||
    !paymentMethod ||
    !paymentImage
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  if (priceSummary?.promoCode) {
    const isValidPromoCode = await PromocodeModel.findOne({
      code: priceSummary.promoCode,
      isActive: true,
    });

    if (isValidPromoCode) {
      const disAmount = (priceSummary.total * isValidPromoCode.discount) / 100;

      priceSummary.discountAmount =
        disAmount > isValidPromoCode.maxAmount
          ? isValidPromoCode.maxAmount
          : disAmount;

      priceSummary.grandTotal =
        priceSummary.total -
        priceSummary.discountAmount +
        priceSummary.deliveryCharge;
    } else {
      res.status(400);
      throw new Error("Invalid promo code");
    }
  } else {
    priceSummary.discountAmount = 0;
    priceSummary.grandTotal = priceSummary.total + priceSummary.deliveryCharge;
  }

  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  let order_id;
  if (!lastOrder) {
    order_id = 1000;
  } else {
    order_id = lastOrder.order_id + 1;
  }

  const order = new Order({
    order_id,
    name,
    orderItems,
    shippingAddress,
    city,
    phone,
    email,
    additionalInfo,
    paymentMethod,
    paymentImage,
    customImage,
    customCaseCoordinates,
    priceSummary,
  });

  const createdOrder = await order.save();
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
      user: "04prashant13@gmail.com",
      pass: "plcy kknn rxku vyvc", // For Gmail, this is an "App Password", not your regular password
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
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          background-color: #ffffff;
          max-width: 600px;
          margin: 40px auto;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .header h1 {
          color: #d9230f;
        }
        .content {
          padding: 20px 0;
          line-height: 1.6;
        }
        .order-details {
          background-color: #f2f2f2;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          font-family: monospace;
        }
        .btn {
          display: inline-block;
          background-color: #d9230f;
          color: white;
          padding: 12px 20px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          font-size: 13px;
          color: #999;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Order!</h1>
        </div>
        <div class="content">
          <p>Hi there, ${name}</p>
          <p>We're excited to let you know that your order has been successfully completed.</p>

          <div class="order-details">
            <strong>Order Details:</strong><br/>
            ${orderDetails}
          </div>

          <p>
            <strong>Track your order here:</strong><br/>
            <a href="${TrackingUrl}" class="btn">Track Order</a>
          </p>

          <p>Thank you for shopping with us at <strong>Casemandu</strong>!</p>
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Casemandu. All rights reserved. Developed by <a href="https://www.mavtech.com.np" target="_blank">Mavtech</a>.
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
