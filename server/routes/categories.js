const express = require("express");
const Category = require("../models/Category");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();

// multer in-memory storage for multipart/form-data
const upload = multer({ storage: multer.memoryStorage() });

// List all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Simple test without file upload (for debugging connectivity)
router.post("/simple-test", async (req, res) => {
  return res.json({
    message: "Simple test successful",
    body: req.body,
    received: true,
  });
});

// Create category with image (admin only)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // TODO: Add admin check
    if (!req.body.name)
      return res.status(400).json({ message: "Category name is required" });
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "categories", resource_type: "auto" },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded))
      );
      stream.end(req.file.buffer);
    });

    const category = new Category({
      name: req.body.name,
      image: result.secure_url,
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category with image (admin only)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    // TODO: Add admin check
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updateData = {
      name: req.body.name || category.name,
    };

    // If new image is uploaded
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "categories", resource_type: "auto" },
          (error, uploaded) => (error ? reject(error) : resolve(uploaded))
        );
        stream.end(req.file.buffer);
      });
      updateData.image = result.secure_url;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category (admin only)
router.delete("/:id", async (req, res) => {
  try {
    // TODO: Add admin check
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
