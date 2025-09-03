const mongoose = require("mongoose");

const heroSliderSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    order: { type: Number, default: 0 }, // ترتيب الصورة في السلايدر
    isActive: { type: Boolean, default: true }, // تفعيل/إلغاء تفعيل الصورة
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeroSlider", heroSliderSchema);

