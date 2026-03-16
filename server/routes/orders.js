const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// List all orders (admin only)
router.get("/", async (req, res) => {
  try {
    // TODO: Add admin check
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name image price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List user orders
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("items.productId", "name image price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Note: Order creation is now handled in public routes for guest checkout

// Update order status (admin only)
router.put("/:id/status", async (req, res) => {
  try {
    // TODO: Add admin check
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
