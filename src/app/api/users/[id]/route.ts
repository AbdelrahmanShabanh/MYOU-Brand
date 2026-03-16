import { NextResponse } from "next/server";
import User from "@/models/User";
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
    const body = await request.json();

    const user = await User.findByIdAndUpdate(id, body, { new: true }).select("-passwordHash");
    
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: any }) {
  try {
    const authResult = await requireAdmin();
    if ("error" in authResult) {
       return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { id } = await context.params;
    await dbConnect();

    const user = await User.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    
    return NextResponse.json({ message: "User deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
