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
const Product = require("./models/productModel.js");


const app = express();

dotenv.config();
connectDB();

// CORS Policy
app.use(cors({
      origin: ["https://client-casemandu.vercel.app", "https://admin-casemandu.vercel.app","http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true, // Allow cookies
    })
  )

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

// (async () => {
//   try {
//     const result = await Product.updateMany(
//       { isActivate: { $exists: false } }, // find old products without the field
//       { $set: { isActivate: true } }      // set them to true
//     );

//     if (result.modifiedCount > 0) {
//       console.log(`✅ Updated ${result.modifiedCount} old products with isActivate:true`);
//     } else {
//       console.log("ℹ️ No old products needed updating.");
//     }
//   } catch (error) {
//     console.error("❌ Error updating old products:", error);
//   }
// })();

// run this after your mongoose connection is ready (e.g., in index.js AFTER connect)
// (async () => {
//   try {
//     const result = await Product.updateMany({}, { $set: { isActivate: true } });
//     console.log("updateMany result:", result);
//     // result has fields like acknowledged, matchedCount, modifiedCount
//     if (result.modifiedCount > 0) {
//       console.log(`✅ Updated ${result.modifiedCount} products to isActivate: true`);
//     } else {
//       console.log("ℹ️ No documents were modified (they may already be true).");
//     }
//   } catch (err) {
//     console.error("❌ Error running updateMany:", err);
//   }
// })();

// (async () => {
//   try {
//     // Calculate date 4 months ago
//     const fourMonthsAgo = new Date();
//     fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

//     // 1️⃣ Set new: true for products added in the last 4 months
//     const recentResult = await Product.updateMany(
//       { createdAt: { $gte: fourMonthsAgo } },
//       { $set: { new: true } }
//     );

//     // 2️⃣ Set new: false for products added before 4 months
//     const oldResult = await Product.updateMany(
//       { createdAt: { $lt: fourMonthsAgo } },
//       { $set: { new: false } }
//     );

//     console.log(`✅ Products added in last 4 months set to new: true → ${recentResult.modifiedCount}`);
//     console.log(`✅ Older products set to new: false → ${oldResult.modifiedCount}`);
//   } catch (err) {
//     console.error("❌ Error updating products:", err);
//   }
// })();



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
