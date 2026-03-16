import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongoose";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: Request, context: { params: any }) {
  try {
    const authResult = await verifyAuth();
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { userId } = await context.params;
    
    // Ensure standard users can only view their own orders
    if (authResult.user.role !== "admin" && authResult.user.userId !== userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const orders = await Order.find({ userId })
      .populate("items.productId", "name image price")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
