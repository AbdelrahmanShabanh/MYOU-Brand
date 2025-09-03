const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Debug: Read .env file directly
const envPath = path.join(__dirname, ".env");
console.log("Looking for .env at:", envPath);
if (fs.existsSync(envPath)) {
  console.log(".env file exists");
  const envContent = fs.readFileSync(envPath, "utf8");
  console.log("Raw .env content:", envContent);
} else {
  console.log(".env file does not exist");
}

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
console.log("MONGODB_URI:", process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;

// Railway-specific logging
console.log("=== RAILWAY DEPLOYMENT DEBUG ===");
console.log("PORT:", PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("RAILWAY_ENVIRONMENT:", process.env.RAILWAY_ENVIRONMENT);
console.log("RAILWAY_SERVICE_NAME:", process.env.RAILWAY_SERVICE_NAME);
console.log("=================================");

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://the-myou-brand.vercel.app",
        "https://vercel.app",
        "https://the-myou-brand-8yf512yqs-abdelrahmanshabans-projects.vercel.app",
      ];

      // Allow any Vercel preview domain
      if (origin.includes("vercel.app") || origin.includes("railway.app")) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  });

const db = mongoose.connection;
db.on("error", (error) => {
  console.error("❌ MongoDB connection error:", error);
  process.exit(1);
});
db.once("open", () => {
  console.log("✅ MongoDB connection established");
});

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/upload");
const promoCodesRoutes = require("./routes/promocodes");
const heroSliderRoutes = require("./routes/heroSlider");
const publicRoutes = require("./routes/public");
const { auth, admin } = require("./middleware/auth");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Public routes (no auth required) - must come before protected routes
app.use("/api/public", publicRoutes);

// Protected order routes (require auth) - for authenticated users only
app.use("/api/orders", auth, orderRoutes);
app.use("/api/cart", auth, cartRoutes); // Require auth for cart
app.use("/api/admin", auth, admin, adminRoutes); // Require admin for admin routes
app.use("/api/upload", auth, admin, uploadRoutes); // Require admin for uploads
app.use("/api/promocodes", promoCodesRoutes);
app.use("/api/hero-slider", heroSliderRoutes);

// Example route
app.get("/", (req, res) => {
  res.send(
    "API is running - CORS FIXED - Updated: " + new Date().toISOString()
  );
});

// Start server with better error handling
app
  .listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Server started successfully!");
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🔗 API available at http://localhost:${PORT}`);
    console.log("✅ Ready to handle requests");
  })
  .on("error", (error) => {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  });

// TODO: Add routes for auth, products, categories, orders, admin, upload

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
