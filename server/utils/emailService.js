const nodemailer = require("nodemailer");

// خدمة إرسال البريد الإلكتروني
class EmailService {
  constructor() {
    // Create transporter for Gmail (you can change this to your email provider)
    console.log("Email Service Config:", {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD ? "***" : "NOT SET",
      adminEmail: process.env.ADMIN_EMAIL,
    });

    // Try multiple connection methods for Railway
    try {
      // Method 1: Standard Gmail with extended timeouts
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER || "your-email@gmail.com",
          pass: process.env.EMAIL_PASSWORD || "your-app-password",
        },
        tls: {
          rejectUnauthorized: false,
        },
        secure: true,
        port: 465,
        // Railway-specific connection settings
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000,   // 30 seconds
        socketTimeout: 60000,     // 60 seconds
        // Alternative connection method
        pool: false,
        maxConnections: 1,
        maxMessages: 1,
      });

      // Test the connection
      this.transporter.verify((error) => {
        if (error) {
          console.log("❌ Primary email transport failed:", error.message);
          this.createFallbackTransporter();
        } else {
          console.log("✅ Primary email transport ready");
        }
      });
    } catch (error) {
      console.log("❌ Error creating primary transport:", error.message);
      this.createFallbackTransporter();
    }
  }

  createFallbackTransporter() {
    console.log("🔄 Creating fallback email transport...");
    try {
      // Method 2: Alternative Gmail settings
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER || "your-email@gmail.com",
          pass: process.env.EMAIL_PASSWORD || "your-app-password",
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: "SSLv3",
        },
        connectionTimeout: 30000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
      });
      console.log("✅ Fallback email transport created");
    } catch (error) {
      console.log("❌ Fallback transport also failed:", error.message);
      this.transporter = null;
    }
  }

  // إرسال تأكيد الطلب عبر البريد الإلكتروني
  async sendOrderConfirmation(order, customerInfo) {
    try {
      console.log("=== EMAIL SERVICE DEBUG ===");
      console.log("Email Service Config:", {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD ? "***" : "NOT SET",
        adminEmail: process.env.ADMIN_EMAIL,
      });
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

      const mailOptions = {
        from: process.env.EMAIL_USER || "your-email@gmail.com",
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
              
              <p>We'll send you updates about your order status. You can also track your order through your account.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }" 
                   style="background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin-right: 10px;">
                  Visit Our Store
                </a>
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/track-order" 
                   style="background: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  Track Your Order
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                If you have any questions, please contact us at support@myoustore.com
              </p>
            </div>
          </div>
        `,
      };

      console.log("Attempting to send email...");
      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        "✅ Order confirmation email sent successfully:",
        result.messageId
      );
      console.log("Email sent to:", customerInfo.email);
      return result;
    } catch (error) {
      console.error(
        "❌ ERROR sending order confirmation email:",
        error.message
      );
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        response: error.response,
      });
      throw error;
    }
  }

  // إرسال إشعار للادمن عن الطلب الجديد
  async sendAdminNotification(order, customerInfo) {
    try {
      const itemsList = order.items
        .map(
          (item) =>
            `<li>${item.productId?.name || "Product"} - Qty: ${
              item.quantity
            } - LE ${item.price}</li>`
        )
        .join("");

      const mailOptions = {
        from: process.env.EMAIL_USER || "your-email@gmail.com",
        to: process.env.ADMIN_EMAIL || "admin@myoustore.com",
        subject: `New Order Received - #${order._id.toString().slice(-8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #333; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">MYOU Store - Admin Notification</h1>
              <p style="margin: 10px 0 0 0;">New Order Received</p>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <h2 style="color: #333;">New Order Details</h2>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
                <p><strong>Name:</strong> ${customerInfo.firstName} ${
          customerInfo.lastName
        }</p>
                <p><strong>Email:</strong> ${customerInfo.email}</p>
                <p><strong>Phone:</strong> ${customerInfo.phone}</p>
                <p><strong>Address:</strong> ${customerInfo.address}, ${
          customerInfo.city
        }, ${customerInfo.country}</p>
              </div>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Order Information</h3>
                <p><strong>Order ID:</strong> #${order._id
                  .toString()
                  .slice(-8)}</p>
                <p><strong>Total Amount:</strong> LE ${order.total?.toFixed(
                  2
                )}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p><strong>Shipping Method:</strong> ${order.shippingMethod}</p>
              </div>
              
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Items Ordered</h3>
                <ul style="list-style: none; padding: 0;">
                  ${itemsList}
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/admin/orders" 
                   style="background: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  View Order in Admin Panel
                </a>
              </div>
            </div>
          </div>
        `,
      };

      console.log("Attempting to send admin notification...");
      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        "✅ Admin notification email sent successfully:",
        result.messageId
      );
      console.log("Admin email sent to:", process.env.ADMIN_EMAIL);
      return result;
    } catch (error) {
      console.error(
        "❌ ERROR sending admin notification email:",
        error.message
      );
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        response: error.response,
      });
      throw error;
    }
  }
}

module.exports = new EmailService();
