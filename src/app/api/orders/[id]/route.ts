import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongoose";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request: Request, context: { params: any }) {
  try {
    const authResult = await requireAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { id } = await context.params;
    await dbConnect();
    const { status } = await request.json();

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
