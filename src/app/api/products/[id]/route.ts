import { NextResponse } from "next/server";
import Product from "@/models/Product";
import dbConnect from "@/lib/mongoose";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request, context: { params: any }) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const product = await Product.findById(id);
    if (!product) {
       return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: any }) {
  try {
    const authResult = await requireAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { id } = await context.params;
    await dbConnect();
    const body = await request.json();

    const update: any = {
      ...body,
      discount: body.discount || 0,
      featured: body.featured || false,
    };

    if (typeof body.category === "string") {
      const category = body.category.trim();
      update.category = category;
      update.categorySlug = category
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }

    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    
    return NextResponse.json(product);
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

    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    
    return NextResponse.json({ message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
