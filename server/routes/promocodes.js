const express = require("express");
const PromoCode = require("../models/PromoCode");
const { auth, admin } = require("../middleware/auth");

const router = express.Router();

// Get all promo codes (admin only)
router.get("/", auth, admin, async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promoCodes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific promo code (public)
router.get("/:code", async (req, res) => {
  try {
    const promoCode = await PromoCode.findOne({
      code: req.params.code.toUpperCase(),
    });

    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    if (!promoCode.isValid()) {
      return res.status(400).json({ message: "Promo code is not valid" });
    }

    res.json(promoCode);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new promo code (admin only)
router.post("/", auth, admin, async (req, res) => {
  try {
    const {
      code,
      discountAmount,
      discountType,
      validFrom,
      validUntil,
      maxUses,
      minOrderAmount,
      description,
      isActive,
    } = req.body;

    // Check if code already exists
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ message: "Promo code already exists" });
    }

    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      discountAmount,
      discountType,
      validFrom: validFrom || new Date(),
      validUntil,
      maxUses: maxUses || null,
      minOrderAmount: minOrderAmount || 0,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    const savedPromoCode = await promoCode.save();
    res.status(201).json(savedPromoCode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a promo code (admin only)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const {
      code,
      discountAmount,
      discountType,
      validFrom,
      validUntil,
      maxUses,
      minOrderAmount,
      description,
      isActive,
    } = req.body;

    // Check if code already exists (excluding current promo code)
    if (code) {
      const existingCode = await PromoCode.findOne({
        code: code.toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (existingCode) {
        return res.status(400).json({ message: "Promo code already exists" });
      }
    }

    const updateData = {
      ...(code && { code: code.toUpperCase() }),
      ...(discountAmount !== undefined && { discountAmount }),
      ...(discountType && { discountType }),
      ...(validFrom && { validFrom }),
      ...(validUntil && { validUntil }),
      ...(maxUses !== undefined && { maxUses: maxUses || null }),
      ...(minOrderAmount !== undefined && { minOrderAmount }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
    };

    const updatedPromoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPromoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    res.json(updatedPromoCode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a promo code (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.json({ message: "Promo code deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Validate and apply promo code (public)
router.post("/validate", async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return res
        .status(400)
        .json({ message: "Code and order amount are required" });
    }

    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    if (!promoCode.isValid()) {
      return res.status(400).json({ message: "Promo code is not valid" });
    }

    if (orderAmount < promoCode.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is LE ${promoCode.minOrderAmount}`,
      });
    }

    const discount = promoCode.calculateDiscount(orderAmount);

    res.json({
      promoCode: {
        _id: promoCode._id,
        code: promoCode.code,
        discountAmount: promoCode.discountAmount,
        discountType: promoCode.discountType,
        description: promoCode.description,
      },
      discount,
      finalAmount: orderAmount - discount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Increment usage count (called when order is placed)
router.post("/:id/use", async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    promoCode.currentUses += 1;
    await promoCode.save();

    res.json({ message: "Usage count updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
