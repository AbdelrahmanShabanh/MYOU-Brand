import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String }, // Base64 string from frontend
    description: { type: String },
    category: { type: String, required: true },
    categorySlug: { type: String, index: true },
    stock: { type: Number, default: 10 }, 
    sizes: [{ type: String }],
    sizeStock: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    discount: { type: Number, default: 0 },
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

export default mongoose.models.Product || mongoose.model("Product", productSchema);
