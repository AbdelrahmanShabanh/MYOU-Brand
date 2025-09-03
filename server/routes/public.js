const express = require("express");
const Order = require("../models/Order");
const router = express.Router();

// Public route for top sellers (no auth required)
router.get("/top-sellers", async (req, res) => {
  try {
    console.log("Fetching best sellers...");

    // First check if there are any orders
    const totalOrders = await Order.countDocuments();
    console.log("Total orders in database:", totalOrders);

    if (totalOrders === 0) {
      console.log("No orders found, returning empty array");
      return res.json([]);
    }

    const topSellers = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          product: { $first: "$product" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 },
    ]);

    console.log("Raw aggregation result:", topSellers);

    // Transform the data to match the expected frontend structure
    const transformedTopSellers = topSellers.map((item) => ({
      _id: item._id,
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
      product: item.product,
    }));

    console.log("Final transformed top sellers:", transformedTopSellers);
    res.json(transformedTopSellers);
  } catch (err) {
    console.error("Error in top-sellers route:", err);
    res.status(500).json({ message: err.message });
  }
});

// Track order by email only (public route - no auth required)
router.post("/track", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Find all orders by email
    const orders = await Order.find({ contact: email })
      .populate("items.productId", "name image price")
      .populate("userId", "name email")
      .sort({ createdAt: -1 }); // Most recent first

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        message: "No orders found for this email address",
      });
    }

    res.json(orders);
  } catch (err) {
    console.error("Error tracking order:", err);
    res.status(500).json({
      message: "Failed to track order",
    });
  }
});

// Create order (public route - no auth required)
router.post("/", async (req, res) => {
  try {
    const Order = require("../models/Order");
    const emailService = require("../utils/emailService");

    const order = new Order({
      userId: req.body.userId,
      items: req.body.items,
      total: req.body.total,
      // Customer Information
      contact: req.body.email, // Use email as contact
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      postalCode: req.body.postalCode,
      phone: req.body.phone,
      // Payment Information
      paymentMethod: req.body.paymentMethod,
      shippingMethod: req.body.shippingMethod,
      // Coupon and Discount
      coupon: req.body.coupon,
      discount: req.body.discount,
      subtotal: req.body.subtotal,
      shipping: req.body.shipping,
    });

    await order.save();

    // Decrement stock for each product in the order
    if (order.items && Array.isArray(order.items)) {
      const Product = require("../models/Product");
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // Send email notifications
    try {
      const customerInfo = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.contact, // Use contact as email
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
      };

      // Send email confirmation to customer
      await emailService.sendOrderConfirmation(order, customerInfo);

      // Send admin notification
      await emailService.sendAdminNotification(order, customerInfo);
    } catch (notificationError) {
      console.error(
        "Email notification error (order still saved):",
        notificationError
      );
      // Don't fail the order if notifications fail
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
