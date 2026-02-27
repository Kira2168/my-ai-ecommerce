import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // In Next.js 15/16, params is a Promise
) {
  try {
    // 1. Unwrap the ID from the URL
    const { id } = await params;

    // 2. Find the specific product
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
    });

    // 3. Handle 404
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 4. Return the data as JSON
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("INDIVIDUAL_FETCH_ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}