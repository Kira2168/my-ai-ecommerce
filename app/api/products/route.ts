import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 1. CREATE NEW ASSET
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const newProduct = await db.product.create({
      data: {
        name: body.name,
        price: parseFloat(body.price),
        category: body.category,
        description: body.description || "Obsidian Grade Asset.",
        image: body.image || null, 
        stock: body.stock ? parseInt(body.stock) : 15,
      } as any, 
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. FETCH ALL ASSETS
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. UPDATE EXISTING ASSET (The Edit Logic)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing Asset ID" }, { status: 400 });
    }

    const updatedProduct = await db.product.update({
      where: { id: id },
      data: {
        ...updateData,
        // Ensure numbers are correctly typed for Prisma
        price: updateData.price ? parseFloat(updateData.price) : undefined,
        stock: updateData.stock ? parseInt(updateData.stock) : undefined,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Update Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. DELETE ASSET
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID Required" }, { status: 400 });

    await db.product.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Asset Purged" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}