import { NextResponse } from "next/server";
import Product from "@/models/Product";
import dbConnect from "@/lib/mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "4");
    const exclude = searchParams.get("exclude");

    const filter: any = {};
    if (exclude && exclude.trim() !== "") {
      filter._id = { $ne: exclude };
    }

    let products = await Product.aggregate([
      { $match: filter },
      { $sample: { size: limit } },
      { $project: { name: 1, price: 1, image: 1, discount: 1 } },
    ]);

    if (products.length < limit && exclude) {
      const additionalProducts = await Product.aggregate([
        { $sample: { size: limit - products.length } },
        { $project: { name: 1, price: 1, image: 1, discount: 1 } },
      ]);

      const existingIds = new Set(products.map((p) => p._id.toString()));
      const uniqueAdditional = additionalProducts.filter(
        (p) => !existingIds.has(p._id.toString())
      );
      products = [...products, ...uniqueAdditional];
    }

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
