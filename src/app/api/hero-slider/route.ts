import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import HeroSlider from "@/models/HeroSlider";
import { requireAdmin } from "@/lib/auth";

// Public Get: Only active slides ordered by "order"
export async function GET(req: Request) {
  try {
    await connectDB();
    const slides = await HeroSlider.find({ isActive: true }).sort("order");
    return NextResponse.json(slides);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}

// POST: Create
export async function POST(req: Request) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { title, subtitle, image } = await req.json();

    if (!title || !subtitle || !image) {
      return NextResponse.json(
        { error: "Please provide all required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const slideCount = await HeroSlider.countDocuments();
    const newSlide = new HeroSlider({
      title,
      subtitle,
      image,
      order: slideCount,
    });

    await newSlide.save();

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}
