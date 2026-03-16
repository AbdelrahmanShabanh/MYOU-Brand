import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import HeroSlider from "@/models/HeroSlider";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: any }
) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    await connectDB();

    const slide = await HeroSlider.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!slide) {
      return NextResponse.json(
        { error: "Hero slide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(slide);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectDB();

    const slide = await HeroSlider.findById(id);

    if (!slide) {
      return NextResponse.json(
        { error: "Hero slide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(slide);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectDB();

    const slide = await HeroSlider.findById(id);

    if (!slide) {
      return NextResponse.json(
        { error: "Hero slide not found" },
        { status: 404 }
      );
    }

    await slide.deleteOne();

    return NextResponse.json({ message: "Hero slide removed" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}
