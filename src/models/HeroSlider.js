import mongoose from "mongoose";

const heroSliderSchema = new mongoose.Schema(
  {
    image: { type: String, required: true }, // Base64
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.HeroSlider || mongoose.model("HeroSlider", heroSliderSchema);
