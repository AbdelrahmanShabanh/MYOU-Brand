const { Resend } = require("resend");

// خدمة إرسال البريد الإلكتروني باستخدام Resend
class EmailService {
  constructor() {
    // Create Resend client
    this.resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log("=== RESEND EMAIL SERVICE INITIALIZED ===");
    console.log("Resend API Key:", process.env.RESEND_API_KEY ? "SET" : "NOT SET");
    console.log("From Email:", process.env.FROM_EMAIL || "noreply@yourdomain.com");
    console.log("Admin Email:", process.env.ADMIN_EMAIL);
    console.log("========================================");
  }

  // إرسال تأكيد الطلب عبر البريد الإلكتروني
  async sendOrderConfirmation(order, customerInfo) {
    try {
      console.log("=== EMAIL SERVICE DEBUG ===");
      console.log("Using Resend email service");
      console.log("Sending order confirmation to:", customerInfo.email);
      console.log("Order details:", {
        orderId: order._id,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        total: order.total,
      });

      const itemsList = order.items
        .map(
          (item) =>
            `<li>${item.productId?.name || "Product"} - Qty: ${
              item.quantity
            } - LE ${item.price}</li>`
        )
        .join("");

      const { data, error } = await this.resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@yourdomain.com",
        to: customerInfo.email,
        subject: `Order Confirmation - Order #${order._id
          .toString()
          .slice(-8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #be185d); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">MYOU Store</h1>
              <p style="margin: 10px 0 0 0;">Order Confirmation</p>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <h2 style="color: #333;">Thank you for your order!</h2>
              <p>Dear ${customerInfo.firstName} ${customerInfo.lastName},</p>
              <p>Your order has been successfully placed and is being processed.</p>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Order Details</h3>
                <p><strong>Order ID:</strong> #${order._id
                  .toString()
                  .slice(-8)}</p>
                <p><strong>Order Date:</strong> ${new Date(
                  order.createdAt
                ).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p><strong>Shipping Method:</strong> ${order.shippingMethod}</p>
              </div>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Items Ordered</h3>
                <ul style="list-style: none; padding: 0;">
                  ${itemsList}
                </ul>
              </div>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
                <p><strong>Subtotal:</strong> LE ${order.subtotal?.toFixed(
                  2
                )}</p>
                <p><strong>Shipping:</strong> LE ${order.shipping?.toFixed(
                  2
                )}</p>
                ${
                  order.discount > 0
                    ? `<p><strong>Discount:</strong> -LE ${order.discount?.toFixed(
                        2
                      )}</p>`
                    : ""
                }
                <p style="font-size: 18px; font-weight: bold; color: #ec4899;"><strong>Total:</strong> LE ${order.total?.toFixed(
                  2
                )}</p>
              </div>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
                <p>${customerInfo.firstName} ${customerInfo.lastName}</p>
                <p>${customerInfo.address}</p>
                <p>${customerInfo.city}, ${customerInfo.country}</p>
                <p>Phone: ${customerInfo.phone}</p>
              </div>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Next Steps</h3>
                <p>We will process your order and ship it as soon as possible. You will receive tracking information once your order ships.</p>
                <p>If you have any questions, please contact our customer support.</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
                <p style="margin: 0; color: #666;">Thank you for choosing MYOU Store!</p>
                <p style="margin: 5px 0 0 0; color: #666;">We appreciate your business.</p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("❌ Resend email error:", error);
        throw new Error(`Resend email failed: ${error.message}`);
      }

      console.log("✅ Order confirmation email sent successfully via Resend");
      console.log("Email ID:", data?.id);
      console.log("Email sent to:", customerInfo.email);
      return data;
    } catch (error) {
      console.error("❌ ERROR sending order confirmation email:", error.message);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // إرسال إشعار للمدير
  async sendAdminNotification(order, customerInfo) {
    try {
      console.log("Sending admin notification via Resend...");
      
      const itemsList = order.items
        .map(
          (item) =>
            `<li>${item.productId?.name || "Product"} - Qty: ${
              item.quantity
            } - LE ${item.price}</li>`
        )
        .join("");

      const { data, error } = await this.resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@yourdomain.com",
        to: process.env.ADMIN_EMAIL,
        subject: `New Order Received - Order #${order._id
          .toString()
          .slice(-8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #be185d); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">MYOU Store</h1>
              <p style="margin: 10px 0 0 0;">New Order Notification</p>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <h2 style="color: #333;">New Order Received!</h2>
              <p>A new order has been placed and requires your attention.</p>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Order Details</h3>
                <p><strong>Order ID:</strong> #${order._id
                  .toString()
                  .slice(-8)}</p>
                <p><strong>Order Date:</strong> ${new Date(
                  order.createdAt
                ).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${customerInfo.firstName} ${customerInfo.lastName}</p>
                <p><strong>Email:</strong> ${customerInfo.email}</p>
                <p><strong>Phone:</strong> ${customerInfo.phone}</p>
                <p><strong>Total Amount:</strong> LE ${order.total?.toFixed(2)}</p>
              </div>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Items Ordered</h3>
                <ul style="list-style: none; padding: 0;">
                  ${itemsList}
                </ul>
              </div>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
                <p>${customerInfo.firstName} ${customerInfo.lastName}</p>
                <p>${customerInfo.address}</p>
                <p>${customerInfo.city}, ${customerInfo.country}</p>
                <p>Phone: ${customerInfo.phone}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
                <p style="margin: 0; color: #666;">Please process this order as soon as possible.</p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("❌ Resend admin notification error:", error);
        throw new Error(`Resend admin notification failed: ${error.message}`);
      }

      console.log("✅ Admin notification email sent successfully via Resend");
      console.log("Email ID:", data?.id);
      console.log("Admin email sent to:", process.env.ADMIN_EMAIL);
      return data;
    } catch (error) {
      console.error("❌ ERROR sending admin notification email:", error.message);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

module.exports = new EmailService();
