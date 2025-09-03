const express = require("express");
const HeroSlider = require("../models/HeroSlider");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();

// multer in-memory storage for multipart/form-data
const upload = multer({ storage: multer.memoryStorage() });

// Get all hero slider items
router.get("/", async (req, res) => {
  try {
    const slides = await HeroSlider.find({ isActive: true }).sort({ order: 1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all hero slider items (admin - including inactive)
router.get("/admin", async (req, res) => {
  try {
    const slides = await HeroSlider.find().sort({ order: 1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new hero slider item
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.body.title || !req.body.subtitle) {
      return res
        .status(400)
        .json({ message: "Title and subtitle are required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "hero-slider", resource_type: "auto" },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded))
      );
      stream.end(req.file.buffer);
    });

    // Get the highest order number
    const maxOrder = await HeroSlider.findOne().sort({ order: -1 });
    const newOrder = maxOrder ? maxOrder.order + 1 : 0;

    const slide = new HeroSlider({
      image: result.secure_url,
      title: req.body.title,
      subtitle: req.body.subtitle,
      order: newOrder,
    });

    await slide.save();
    res.status(201).json(slide);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update hero slider item
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const slide = await HeroSlider.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }

    const updateData = {
      title: req.body.title || slide.title,
      subtitle: req.body.subtitle || slide.subtitle,
      order:
        req.body.order !== undefined ? parseInt(req.body.order) : slide.order,
      isActive:
        req.body.isActive !== undefined
          ? req.body.isActive === "true"
          : slide.isActive,
    };

    // If new image is uploaded
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "hero-slider", resource_type: "auto" },
          (error, uploaded) => (error ? reject(error) : resolve(uploaded))
        );
        stream.end(req.file.buffer);
      });
      updateData.image = result.secure_url;
    }

    const updatedSlide = await HeroSlider.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedSlide);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete hero slider item
router.delete("/:id", async (req, res) => {
  try {
    const slide = await HeroSlider.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }
    res.json({ message: "Slide deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reorder slides
router.post("/reorder", async (req, res) => {
  try {
    const { slides } = req.body; // Array of { id, order }

    for (const slide of slides) {
      await HeroSlider.findByIdAndUpdate(slide.id, { order: slide.order });
    }

    res.json({ message: "Slides reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

