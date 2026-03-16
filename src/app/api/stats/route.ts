import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Product from "@/models/Product";
import dbConnect from "@/lib/mongoose";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "month"; 

    const now = new Date();
    let startDate;

    if (range === "week") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (range === "year") {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    } else {
      // Default to 30 days
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    }

    // Revenue
    const orders = await Order.find({ createdAt: { $gte: startDate } });
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    // Orders Count
    const ordersCount = orders.length;

    // Unique Customers
    const uniqueCustomers = new Set(orders.map((order) => order.contact));
    const customersCount = uniqueCustomers.size;

    // Products Count
    const productsCount = await Product.countDocuments();

    return NextResponse.json({
      revenue: { total: revenue, period: range, change: 0 },
      orders: { total: ordersCount, period: range, change: 0 },
      customers: { total: customersCount, period: range, change: 0 },
      products: { total: productsCount, period: range, change: 0 },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
