import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "./mongoose";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function verifyAuth() {
  await dbConnect();
  
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "No token provided", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    return { user: decoded, status: 200 };
  } catch (error) {
    return { error: "Invalid token", status: 401 };
  }
}

export async function requireAdmin(req?: Request) {
  const authResult = await verifyAuth();
  if (authResult.error) {
    return authResult; // Returns the 401 error
  }

  if (authResult.user.role !== "admin") {
    return { error: "Admin access required", status: 403 };
  }

  return { user: authResult.user, status: 200 };
}
