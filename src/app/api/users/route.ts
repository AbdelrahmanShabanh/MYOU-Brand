import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongoose";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin();
    if ("error" in authResult) {
       return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    await dbConnect();
    const users = await User.find().select("-passwordHash");
    
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
