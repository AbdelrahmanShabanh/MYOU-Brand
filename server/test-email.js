// Test script for email service debugging
require("dotenv").config();
const emailService = require("./utils/emailService");

async function testEmailService() {
  console.log("=== TESTING EMAIL SERVICE ===");

  try {
    // Test customer confirmation email
    console.log("\n1. Testing customer confirmation email...");
    const mockOrder = {
      _id: "test123",
      items: [{ productId: { name: "Test Product" }, quantity: 1, price: 100 }],
      total: 100,
      createdAt: new Date(),
    };

    const mockCustomerInfo = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "123456789",
      address: "Test Address",
      city: "Test City",
      country: "Test Country",
    };

    await emailService.sendOrderConfirmation(mockOrder, mockCustomerInfo);
    console.log("✅ Customer confirmation email test passed");

    // Test admin notification
    console.log("\n2. Testing admin notification...");
    await emailService.sendAdminNotification(mockOrder, mockCustomerInfo);
    console.log("✅ Admin notification test passed");

    console.log("\n🎉 All email tests passed!");
  } catch (error) {
    console.error("\n❌ Email test failed:", error.message);
    console.error("Error details:", error);
  }
}

// Run the test
testEmailService();

