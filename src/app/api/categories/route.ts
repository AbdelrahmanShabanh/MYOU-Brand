import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Check admin
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { name, image } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await connectDB();

    const category = new Category({
      name,
      image: image || "",
    });

    await category.save();
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}
