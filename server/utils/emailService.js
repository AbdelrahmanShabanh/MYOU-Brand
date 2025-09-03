const { Resend } = require("resend");
const nodemailer = require("nodemailer");

// خدمة إرسال البريد الإلكتروني باستخدام Resend
class EmailService {
  constructor() {
    // Validate required environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ CRITICAL: RESEND_API_KEY is not set!");
      throw new Error("RESEND_API_KEY environment variable is required");
    }

    if (!process.env.FROM_EMAIL) {
      console.error("❌ CRITICAL: FROM_EMAIL is not set!");
      throw new Error("FROM_EMAIL environment variable is required");
    }

    if (!process.env.ADMIN_EMAIL) {
      console.error("❌ CRITICAL: ADMIN_EMAIL is not set!");
      throw new Error("ADMIN_EMAIL environment variable is required");
    }

    // Create Resend client
    this.resend = new Resend(process.env.RESEND_API_KEY);

    // Initialize SMTP transporter if SMTP env vars are present
    this.smtpEnabled =
      !!process.env.SMTP_HOST &&
      !!process.env.SMTP_PORT &&
      !!process.env.SMTP_USER &&
      !!process.env.SMTP_PASS;

    if (this.smtpEnabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure:
          String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    console.log("=== RESEND EMAIL SERVICE INITIALIZED ===");
    console.log(
      "Resend API Key:",
      process.env.RESEND_API_KEY ? "SET" : "NOT SET"
    );
    console.log(
      "From Email:",
      process.env.FROM_EMAIL || "noreply@yourdomain.com"
    );
    console.log("Admin Email:", process.env.ADMIN_EMAIL);
    console.log("SMTP Enabled:", this.smtpEnabled ? "YES" : "NO");
    console.log("========================================");
  }

  async sendViaSMTP(to, subject, html) {
    if (!this.smtpEnabled || !this.transporter) {
      throw new Error("SMTP transporter is not configured");
    }
    const fromEmail =
      process.env.SMTP_FROM ||
      process.env.FROM_EMAIL ||
      "noreply@yourdomain.com";
    const info = await this.transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return info;
  }

  // إرسال تأكيد الطلب عبر البريد الإلكتروني
  async sendOrderConfirmation(order, customerInfo) {
    try {
      console.log("=== EMAIL SERVICE DEBUG ===");
      const toEmail = (customerInfo.email || "").toString().trim();
      console.log("Sending order confirmation to:", toEmail);
      console.log("Order details:", {
        orderId: order._id,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        total: order.total,
      });

      // Basic email format validation to avoid Resend invalid `to` errors
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(toEmail)) {
        throw new Error(
          "Invalid customer email address for confirmation email"
        );
      }

      const itemsList = order.items
        .map(
          (item) =>
            `<li>${item.productId?.name || "Product"} - Qty: ${
              item.quantity
            } - LE ${item.price}</li>`
        )
        .join("");

      const subject = `Order Confirmation - Order #${order._id
        .toString()
        .slice(-8)}`;
      const html = `
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
                <a href="${
                  process.env.FRONTEND_URL ||
                  "https://the-myou-brand.vercel.app"
                }/track-order" 
                   style="background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px; font-weight: bold;">
                  📦 Track Your Order
                </a>
                <br>
                <a href="${
                  process.env.FRONTEND_URL ||
                  "https://the-myou-brand.vercel.app"
                }" 
                   style="background: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px; font-weight: bold;">
                  🛍️ Continue Shopping
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
                <p style="margin: 0; color: #666;">Thank you for choosing MYOU Store!</p>
                <p style="margin: 5px 0 0 0; color: #666;">We appreciate your business.</p>
              </div>
            </div>
          </div>
        `;

      // Try Resend first, fallback to SMTP if available

      try {
        if (!process.env.RESEND_API_KEY) {
          throw new Error("RESEND_API_KEY is not configured");
        }

        const { data, error } = await this.resend.emails.send({
          from: process.env.FROM_EMAIL || "noreply@yourdomain.com",
          to: toEmail,
          subject,
          html,
        });

        if (error) {
          console.error("❌ Resend email error:", error);
          console.error("❌ Resend error details:", {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            details: error,
          });

          // Handle specific Resend errors
          if (error.statusCode === 401) {
            throw new Error("Resend API key is invalid or expired");
          } else if (error.statusCode === 403) {
            throw new Error(
              "Resend API key doesn't have permission to send emails"
            );
          } else if (error.statusCode === 422) {
            throw new Error(
              "Invalid email format or domain not verified in Resend"
            );
          } else if (error.statusCode === 429) {
            throw new Error("Resend rate limit exceeded");
          } else {
            throw new Error(
              `Resend email failed: ${error.message || "Unknown error"}`
            );
          }
        }

        console.log("✅ Order confirmation email sent successfully via Resend");
        console.log("Email ID:", data?.id);
        console.log("Email sent to:", toEmail);
        emailSent = true;
        return data;
      } catch (resendError) {
        console.error("❌ Resend failed, trying SMTP fallback...");

        // Try SMTP fallback if available
        if (this.smtpEnabled && this.transporter) {
          try {
            const smtpResult = await this.sendViaSMTP(toEmail, subject, html);
            console.log(
              "✅ Order confirmation email sent successfully via SMTP fallback"
            );
            console.log("SMTP result:", smtpResult);
            emailSent = true;
            return smtpResult;
          } catch (smtpError) {
            console.error("❌ SMTP fallback also failed:", smtpError.message);
            throw new Error(
              `Both Resend and SMTP failed. Resend: ${resendError.message}, SMTP: ${smtpError.message}`
            );
          }
        } else {
          console.error("❌ No SMTP fallback available");
          throw resendError;
        }
      }
    } catch (error) {
      console.error(
        "❌ ERROR sending order confirmation email:",
        error.message
      );
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
      const itemsList = order.items
        .map(
          (item) =>
            `<li>${item.productId?.name || "Product"} - Qty: ${
              item.quantity
            } - LE ${item.price}</li>`
        )
        .join("");

      const adminTo = (process.env.ADMIN_EMAIL || "").toString().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(adminTo)) {
        throw new Error("Invalid ADMIN_EMAIL address");
      }

      const subject = `New Order Received - Order #${order._id
        .toString()
        .slice(-8)}`;
      const html = `
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
                <p><strong>Customer:</strong> ${customerInfo.firstName} ${
        customerInfo.lastName
      }</p>
                <p><strong>Email:</strong> ${customerInfo.email}</p>
                <p><strong>Phone:</strong> ${customerInfo.phone}</p>
                <p><strong>Total Amount:</strong> LE ${order.total?.toFixed(
                  2
                )}</p>
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
                 <a href="${
                   process.env.FRONTEND_URL ||
                   "https://the-myou-brand.vercel.app"
                 }/admin/orders" 
                    style="background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px; font-weight: bold;">
                   📋 View Order in Admin Panel
                 </a>
                 <br>
                 <a href="${
                   process.env.FRONTEND_URL ||
                   "https://the-myou-brand.vercel.app"
                 }/admin" 
                    style="background: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px; font-weight: bold;">
                   🏠 Go to Admin Dashboard
                 </a>
                 <br>
                 <p style="margin: 20px 0 0 0; color: #666;">Please process this order as soon as possible.</p>
               </div>
            </div>
          </div>
        `;

      // Try Resend first, fallback to SMTP if available
      try {
        if (!process.env.RESEND_API_KEY) {
          throw new Error("RESEND_API_KEY is not configured");
        }

        const { data, error } = await this.resend.emails.send({
          from: process.env.FROM_EMAIL || "noreply@yourdomain.com",
          to: adminTo,
          subject,
          html,
        });

        if (error) {
          console.error("❌ Resend admin notification error:", error);
          console.error("❌ Resend admin error details:", {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            details: error,
          });

          // Handle specific Resend errors
          if (error.statusCode === 401) {
            throw new Error("Resend API key is invalid or expired");
          } else if (error.statusCode === 403) {
            throw new Error(
              "Resend API key doesn't have permission to send emails"
            );
          } else if (error.statusCode === 422) {
            throw new Error(
              "Invalid email format or domain not verified in Resend"
            );
          } else if (error.statusCode === 429) {
            throw new Error("Resend rate limit exceeded");
          } else {
            throw new Error(
              `Resend admin notification failed: ${
                error.message || "Unknown error"
              }`
            );
          }
        }

        console.log("✅ Admin notification email sent successfully via Resend");
        console.log("Email ID:", data?.id);
        console.log("Admin email sent to:", adminTo);
        return data;
      } catch (resendError) {
        console.error(
          "❌ Resend admin notification failed, trying SMTP fallback..."
        );

        // Try SMTP fallback if available
        if (this.smtpEnabled && this.transporter) {
          try {
            const smtpResult = await this.sendViaSMTP(adminTo, subject, html);
            console.log(
              "✅ Admin notification email sent successfully via SMTP fallback"
            );
            console.log("SMTP result:", smtpResult);
            return smtpResult;
          } catch (smtpError) {
            console.error("❌ SMTP fallback also failed:", smtpError.message);
            throw new Error(
              `Both Resend and SMTP failed for admin notification. Resend: ${resendError.message}, SMTP: ${smtpError.message}`
            );
          }
        } else {
          console.error("❌ No SMTP fallback available for admin notification");
          throw resendError;
        }
      }
    } catch (error) {
      console.error(
        "❌ ERROR sending admin notification email:",
        error.message
      );
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

module.exports = new EmailService();
