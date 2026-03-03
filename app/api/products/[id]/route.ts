import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL: You must await params in Next.js 15/16 API routes
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      console.error(`DATABASE: Asset ${id} not found`);
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("API_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}