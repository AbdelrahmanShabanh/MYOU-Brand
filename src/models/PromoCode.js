import mongoose from "mongoose";

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

// We need to retain these methods, but in serverless we might recreate them as pure functions or just rely on the mongoose model methods.
promoCodeSchema.methods.isValid = function () {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.validUntil && now > this.validUntil) return false;
  if (this.validFrom && now < this.validFrom) return false;
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

export default mongoose.models.PromoCode || mongoose.model("PromoCode", promoCodeSchema);
