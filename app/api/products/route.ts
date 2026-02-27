import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // We add 'image' and 'stock' to the injection logic
    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        price: parseFloat(body.price),
        category: body.category,
        description: body.description || "Obsidian Grade Asset.",
        // These fields might need a schema migration, but we include them here
        image: body.image || null, 
        stock: body.stock ? parseInt(body.stock) : 15,
      } as any, // 'as any' bypasses strict type checks if you haven't migrated yet
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc' // Newest assets appear first
      }
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}