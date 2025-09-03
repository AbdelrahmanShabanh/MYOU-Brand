const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true }, // percentage or fixed
    type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    minOrder: { type: Number, default: 0 }, // minimum order value
    expiry: { type: Date },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromoCode", promoCodeSchema);
