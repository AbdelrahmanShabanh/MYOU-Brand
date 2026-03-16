import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import HeroSlider from "@/models/HeroSlider";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    await connectDB();
    const slides = await HeroSlider.find().sort("order");
    return NextResponse.json(slides);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}
