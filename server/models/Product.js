const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }], // URLs or GridFS IDs
    description: { type: String },
    category: { type: String, required: true },
    stock: { type: Number, default: 10 },
    sizes: [{ type: String }], // Available sizes (e.g., ["S", "M", "L", "XL"])
    discount: { type: Number, default: 0 }, // percentage or fixed amount
    featured: { type: Boolean, default: false },
    features: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length >= 3, "At least 3 features required"],
    },
    shippingInfo: { type: String },
    shippingCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
