import { NextResponse } from "next/server";
import PromoCode from "@/models/PromoCode";
import dbConnect from "@/lib/mongoose";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { code, orderAmount } = await request.json();

    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promoCode) {
      return NextResponse.json(
        { message: "Invalid or inactive promo code" },
        { status: 404 }
      );
    }

    // Check expiration date
    if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
      return NextResponse.json(
        { message: "Promo code has expired" },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (
      promoCode.minOrderAmount &&
      orderAmount < promoCode.minOrderAmount
    ) {
      return NextResponse.json(
        {
          message: `Minimum order amount for this code is LE ${promoCode.minOrderAmount}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { discount: promoCode.discount },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
