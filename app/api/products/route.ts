import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const MAX_IMAGES = 10;
const MAX_DATA_URL_LENGTH = 2_000_000;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isImageDataUrl(value: string) {
  return /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(value);
}

function sanitizeImages(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const cleaned = input
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((value) => {
      if (isHttpUrl(value)) return true;
      if (isImageDataUrl(value) && value.length <= MAX_DATA_URL_LENGTH) return true;
      return false;
    });

  return cleaned.slice(0, MAX_IMAGES);
}

// 1. CREATE NEW ASSET
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const images = sanitizeImages(body.images);
    const primaryImage = body.image || images[0] || null;
    
    const newProduct = await db.product.create({
      data: {
        name: body.name,
        price: parseFloat(body.price),
        category: body.category,
        description: body.description || "Obsidian Grade Asset.",
        image: primaryImage,
        images: images.length > 0 ? images : undefined,
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

    const images = sanitizeImages(updateData.images);
    const updatedProduct = await db.product.update({
      where: { id: id },
      data: {
        ...updateData,
        image: updateData.image || images[0] || undefined,
        images: images.length > 0 ? images : undefined,
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