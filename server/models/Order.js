const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true, // Make userId optional for guest checkout
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    // Customer Information
    contact: { type: String, required: true }, // Email or phone
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String },
    phone: { type: String, required: true },
    // Payment Information
    paymentMethod: { type: String, required: true },
    shippingMethod: { type: String, required: true },
    // Card Information (optional, for card payments)
    cardNumber: { type: String },
    cardExpiry: { type: String },
    cardCVC: { type: String },
    cardName: { type: String },
    // Coupon and Discount
    coupon: { type: String },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
