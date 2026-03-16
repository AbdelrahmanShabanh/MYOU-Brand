import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth();
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const user = await User.findById(authResult.user.userId).select("-passwordHash");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
