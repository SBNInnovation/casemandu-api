const express = require("express");

const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Or your email provider
  auth: {
    user: "04prashant13@gmail.com",
    pass: "plcy kknn rxku vyvc", // For Gmail, this is an "App Password", not your regular password
  },
});

async function createEmailTest(req, res) {
  const { customerEmail, orderDetails, TrackingUrl } = req.body;

  if (!customerEmail || !orderDetails || !TrackingUrl) {
    return res.status(400).json({
      message: "customerEmail, orderDetails, and TrackingUrl are required.",
    });
  }

  const mailOptions = {
    from: "No-reply Casemandu Order <no-reply@casemandu.com>",
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
          <p>Hi there,</p>
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
          &copy; ${new Date().getFullYear()} Casemandu. All rights reserved.
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

router.route("/").post(createEmailTest);

module.exports = router;
