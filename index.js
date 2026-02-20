const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/connectDB.js");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
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
const youtubeRoutes = require("./routes/youtubeRoute.js");

// const Product = require("./models/productModel.js");
const { dashboardRouter } = require("./routes/dashboardRoutes.js");
const { deleteMany } = require("./models/orderModel.js");
const Order = require("./models/orderModel.js");
// const PhoneModel = require("./models/phoneModel.js");
// const Category = require("./models/categoryModel.js");

const app = express();
const server = http.createServer(app);

dotenv.config();
connectDB();

// CORS Policy
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://casemandu.com.np",
      "https://www.casemandu.com.np",
      "https://customize.casemandu.com.np",
      "https://admin.casemandu.com.np",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.options("*", cors());

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
app.use("/api/youtube", youtubeRoutes);

app.get("/", (req, res) => {
  res.send("Casemandu api is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://casemandu.com.np",
      "https://www.casemandu.com.np",
      "https://customize.casemandu.com.np",
      "https://admin.casemandu.com.np",
    ], // change in production
    methods: ["GET", "POST"],
  },
});

// make io accessible everywhere
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-admin", () => {
    socket.join("admins");
    console.log("Admin joined admins room");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { server };
//updated

// Export for Vercel
// module.exports = app;
// module.exports.handler = serverless(app);

// "node": "18.x"
