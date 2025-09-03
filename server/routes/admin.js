const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { auth, admin } = require("../middleware/auth");

const router = express.Router();

// Get analytics (sales, users, products)
router.get("/analytics", async (req, res) => {
  try {
    const range = req.query.range || "month"; // 'week', 'month', 'year'
    const now = new Date();
    let startDate;
    if (range === "week") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      );
    } else if (range === "year") {
      startDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
    } else {
      // Default to 30 days
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 30
      );
    }
    // Revenue
    const orders = await Order.find({ createdAt: { $gte: startDate } });
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    // Orders
    const ordersCount = orders.length;
    // Customers - count unique customers from orders
    const uniqueCustomers = new Set(orders.map((order) => order.contact));
    const customersCount = uniqueCustomers.size;
    // Products
    const products = await Product.find();
    const productsCount = products.length;
    res.json({
      revenue: { total: revenue, period: range, change: 0 },
      orders: { total: ordersCount, period: range, change: 0 },
      customers: { total: customersCount, period: range, change: 0 },
      products: { total: productsCount, period: range, change: 0 },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List users
router.get("/users", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user
router.put("/users/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user
router.delete("/users/:id", auth, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
