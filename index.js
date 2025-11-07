const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/connectDB");
const bodyParser = require("body-parser");
const cors = require("cors");

// importing middlewares
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// Import routes
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const caseTypeRoutes = require("./routes/caseTypeRoutes");
const sliderImageRoutes = require("./routes/sliderImageRoutes");
const customerRoutes = require("./routes/customerRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const offerRoutes = require("./routes/offerRoutes");
const userRoutes = require("./routes/userRoutes");
const promocodeRoutes = require("./routes/promocodeRoute.js");
const phoneRoutes = require("./routes/phoneRoutes.js");
const pinterestRoute = require("./routes/pinterestRoutes.js");
const emailTest = require("./routes/ConfirmEmail.js");
const aiRoutes = require("./routes/aiRoute.js");
const optionRoutes = require("./routes/optionRoutes.js");

const app = express();

dotenv.config();
connectDB();

// CORS Policy
app.use(cors());

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.get("/", (req, res) => {
  res.send("Casemandu api is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
