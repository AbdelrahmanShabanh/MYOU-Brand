const express = require("express");
const Product = require("../models/Product");
const { auth, admin } = require("../middleware/auth");

const router = express.Router();

// List all products (optionally filter by category or featured)
router.get("/", async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = {};
    if (category) {
      // Accept both slug (e.g. "cover-ups") and plain name (any case)
      const slug = String(category).toLowerCase();
      filter.$or = [
        { categorySlug: slug },
        { category: new RegExp(`^${slug}$`, "i") },
      ];
    }
    if (featured === "true") filter.featured = true;
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get random products (for recommendations)
router.get("/random", async (req, res) => {
  try {
    const { limit = 4, exclude } = req.query;
    const filter = {};

    // Exclude the current product if specified
    if (exclude && exclude.trim() !== "") {
      filter._id = { $ne: exclude };
    }

    // Get random products using aggregation
    let products = await Product.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(limit) } },
      { $project: { name: 1, price: 1, image: 1, images: 1, isSoldOut: 1 } },
    ]);

    // If we don't have enough products, try to get more without the exclude filter
    if (products.length < parseInt(limit) && exclude) {
      const additionalProducts = await Product.aggregate([
        { $sample: { size: parseInt(limit) - products.length } },
        { $project: { name: 1, price: 1, image: 1, images: 1, isSoldOut: 1 } },
      ]);

      // Combine products, avoiding duplicates
      const existingIds = new Set(products.map((p) => p._id.toString()));
      const uniqueAdditional = additionalProducts.filter(
        (p) => !existingIds.has(p._id.toString())
      );
      products = [...products, ...uniqueAdditional];
    }

    res.json(products);
  } catch (err) {
    console.error("Error fetching random products:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product (admin only)
router.post("/", auth, admin, async (req, res) => {
  try {
    // Derive a slug from the category string
    const category = (req.body.category || "").toString().trim();
    const categorySlug = category
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const product = new Product({
      ...req.body,
      category,
      categorySlug,
      discount: req.body.discount || 0,
      featured: req.body.featured || false,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product (admin only)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const update = {
      ...req.body,
      discount: req.body.discount || 0,
      featured: req.body.featured || false,
    };
    if (typeof req.body.category === "string") {
      const category = req.body.category.trim();
      update.category = category;
      update.categorySlug = category
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
