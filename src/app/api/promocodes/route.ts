import { NextResponse } from "next/server";
import PromoCode from "@/models/PromoCode";
import dbConnect from "@/lib/mongoose";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    await dbConnect();
    const codes = await PromoCode.find().sort({ createdAt: -1 });
    return NextResponse.json(codes);
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
    const newCode = new PromoCode(body);
    await newCode.save();
    return NextResponse.json(newCode, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
