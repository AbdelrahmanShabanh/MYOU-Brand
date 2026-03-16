const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discountAmount: { type: Number, required: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    minOrderAmount: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    maxUses: { type: Number, default: null },
    currentUses: { type: Number, default: 0 },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Add methods to the schema
promoCodeSchema.methods.isValid = function () {
  const now = new Date();

  // Check if promo code is active
  if (!this.isActive) return false;

  // Check if promo code has expired
  if (this.validUntil && now > this.validUntil) return false;

  // Check if promo code is not yet valid
  if (this.validFrom && now < this.validFrom) return false;

  // Check usage limit
  if (this.maxUses && this.currentUses >= this.maxUses) return false;

  return true;
};

promoCodeSchema.methods.calculateDiscount = function (orderAmount) {
  if (this.discountType === "percentage") {
    return (orderAmount * this.discountAmount) / 100;
  } else {
    return this.discountAmount;
  }
};

module.exports = mongoose.model("PromoCode", promoCodeSchema);
