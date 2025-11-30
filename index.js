const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/connectDB.js");
const bodyParser = require("body-parser");
const cors = require("cors");
const serverless = require("serverless-http"); // import

// importing middlewares
const { notFound, errorHandler } = require("./middlewares/errorMiddleware.js");

// Import routes
const categoryRoutes = require("./routes/categoryRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const caseTypeRoutes = require("./routes/caseTypeRoutes.js");
const sliderImageRoutes = require("./routes/sliderImageRoutes.js");
const customerRoutes = require("./routes/customerRoutes.js");
const bannerRoutes = require("./routes/bannerRoutes.js");
const offerRoutes = require("./routes/offerRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const promocodeRoutes = require("./routes/promocodeRoute.js");
const phoneRoutes = require("./routes/phoneRoutes.js");
const pinterestRoute = require("./routes/pinterestRoutes.js");
const emailTest = require("./routes/ConfirmEmail.js");
const aiRoutes = require("./routes/aiRoute.js");
const optionRoutes = require("./routes/optionRoutes.js");

// const Product = require("./models/productModel.js");
const { dashboardRouter } = require("./routes/dashboardRoutes.js");
// const PhoneModel = require("./models/phoneModel.js");
// const Category = require("./models/categoryModel.js");



const app = express();

dotenv.config();
connectDB();

// CORS Policy
app.use(cors({
      origin: ["https://client-casemandu.vercel.app", "https://admin-casemandu.vercel.app","http://localhost:3000", "https://casemandu-client.vercel.app"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true, // Allow cookies
    })
  )

// Body parser
app.use(express.json());

// Mount routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/casetypes", caseTypeRoutes);
app.use("/api/sliderimages", sliderImageRoutes);
app.use("/api/happy-customers", customerRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/promocodes", promocodeRoutes);
app.use("/api/phones", phoneRoutes);
app.use("/api/pinterest", pinterestRoute);
app.use("/api/emailtest", emailTest);
app.use("/api/ai", aiRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.send("Casemandu api is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export for Vercel
// module.exports = app;
// module.exports.handler = serverless(app);

 // "node": "18.x"
