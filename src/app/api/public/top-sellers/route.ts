import { NextResponse } from "next/server";
import Product from "@/models/Product";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongoose";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Find the most sold products by aggregating orders
    const topSellersAgg = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 8 }
    ]);

    const topSellers = [];

    // Fallback: If no orders exist yet, just return the newest or featured products
    if (topSellersAgg.length === 0) {
      const defaultProducts = await Product.find({}).limit(8).exec();
      for (const product of defaultProducts) {
        topSellers.push({
          _id: product._id.toString(),
          totalQuantity: 0,
          totalRevenue: 0,
          product: {
             _id: product._id.toString(),
             name: product.name,
             image: product.image || "",
             images: product.images || [],
             price: product.price,
             category: product.category,
             description: product.description,
          }
        });
      }
      return NextResponse.json(topSellers);
    }

    // Populate actual top sellers
    for (const item of topSellersAgg) {
      const product = await Product.findById(item._id);
      if (product) {
        topSellers.push({
          ...item,
          product: {
             _id: product._id.toString(),
             name: product.name,
             image: product.image || "",
             images: product.images || [],
             price: product.price,
             category: product.category,
             description: product.description,
          }
        });
      }
    }

    return NextResponse.json(topSellers);
  } catch (error: any) {
    console.error("Top Sellers API Error:", error);
    return NextResponse.json({ message: "Failed to fetch top sellers" }, { status: 500 });
  }
}
