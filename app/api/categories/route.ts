import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_CATEGORIES = [
  "Apparel",
  "Accessories",
  "Tech",
  "Digital",
  "Food",
  "Beauty",
  "Home",
  "Art",
  "Toys",
];

async function ensureDefaults() {
  const count = await db.category.count();
  if (count > 0) return;

  await db.category.createMany({
    data: DEFAULT_CATEGORIES.map((name) => ({ name })),
    skipDuplicates: true,
  });
}

export async function GET() {
  try {
    await ensureDefaults();
    const categories = await db.category.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const category = await db.category.create({ data: { name } });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
