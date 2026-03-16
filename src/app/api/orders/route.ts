import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Product from "@/models/Product";
import dbConnect from "@/lib/mongoose";
import { requireAdmin } from "@/lib/auth";

// List all orders (admin only)
export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    await dbConnect();
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name image price")
      .sort({ createdAt: -1 });
    
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Create order (Public route)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const order = new Order({
      userId: body.userId,
      items: body.items,
      total: body.total,
      contact: body.email, 
      firstName: body.firstName,
      lastName: body.lastName,
      address: body.address,
      city: body.city,
      country: body.country,
      postalCode: body.postalCode,
      phone: body.phone,
      paymentMethod: body.paymentMethod,
      shippingMethod: body.shippingMethod,
      coupon: body.coupon,
      discount: body.discount,
      subtotal: body.subtotal,
      shipping: body.shipping,
    });

    await order.save();

    // Decrement stock for each product
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // TODO: Integrate Email Notifications properly pointing to Next.js routes/services
    
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
