import { NextResponse } from "next/server";
import Product from "@/models/Product";
import dbConnect from "@/lib/mongoose";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const filter: any = {};
    if (category) {
      const slug = String(category).toLowerCase();
      filter.$or = [
        { categorySlug: slug },
        { category: new RegExp(`^${slug}$`, "i") },
      ];
    }
    if (featured === "true") filter.featured = true;

    const products = await Product.find(filter);
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    await dbConnect();
    const body = await request.json();

    const category = (body.category || "").toString().trim();
    const categorySlug = category
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const product = new Product({
      ...body,
      category,
      categorySlug,
      discount: body.discount || 0,
      featured: body.featured || false,
    });
    
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
