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
    console.log("=== ORDER CREATION DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Email from request:", req.body.email);
    console.log("Contact from request:", req.body.contact);

    const Order = require("../models/Order");
    const emailService = require("../utils/emailService");

    // Test email service import and configuration
    console.log("Email service imported:", !!emailService);
    console.log("Email service methods:", Object.keys(emailService));
    console.log("Environment variables check:");
    console.log(
      "- RESEND_API_KEY:",
      process.env.RESEND_API_KEY ? "SET" : "NOT SET"
    );
    console.log("- FROM_EMAIL:", process.env.FROM_EMAIL);
    console.log("- ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
    console.log("- SMTP_ENABLED:", !!process.env.SMTP_HOST);

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
        const product = await Product.findById(item.productId);
        if (product) {
          // If product has size-based stock, decrement the specific size
          if (
            item.size &&
            product.sizeStock &&
            product.sizeStock.has(item.size)
          ) {
            const currentSizeStock = product.sizeStock.get(item.size) || 0;
            if (currentSizeStock >= item.quantity) {
              product.sizeStock.set(
                item.size,
                currentSizeStock - item.quantity
              );
              await product.save();
            } else {
              throw new Error(`Insufficient stock for size ${item.size}`);
            }
          } else {
            // Fallback to general stock for backward compatibility
            if (product.stock >= item.quantity) {
              await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity },
              });
            } else {
              throw new Error("Insufficient stock");
            }
          }
        }
      }
    }

    // Send email notifications
    try {
      console.log("=== EMAIL NOTIFICATION DEBUG ===");
      console.log("Order ID:", order._id);
      console.log("Customer email:", req.body.email);

      const customerInfo = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.contact, // Use the same email field as the order
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
      };

      console.log("Customer info:", customerInfo);

      // Send email confirmation to customer
      console.log("Sending customer confirmation email...");
      console.log("Email service object:", emailService);
      console.log(
        "sendOrderConfirmation method:",
        typeof emailService.sendOrderConfirmation
      );

      try {
        await emailService.sendOrderConfirmation(order, customerInfo);
        console.log("✅ Customer confirmation email sent successfully");
      } catch (emailError) {
        console.error("❌ Email sending failed:", emailError);
        throw emailError;
      }

      // Send admin notification
      console.log("Sending admin notification email...");
      await emailService.sendAdminNotification(order, customerInfo);
      console.log("✅ Admin notification email sent successfully");

      console.log("=== EMAIL NOTIFICATIONS COMPLETED ===");
    } catch (notificationError) {
      console.error(
        "❌ Email notification error (order still saved):",
        notificationError
      );
      console.error("Error details:", {
        message: notificationError.message,
        stack: notificationError.stack,
      });
      // Don't fail the order if notifications fail
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
