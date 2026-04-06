import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = String(body.id || "").trim();
    const status = String(body.status || "").trim();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 });
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const cleanupEmpty = searchParams.get("cleanupEmpty");

    if (cleanupEmpty === "1") {
      const deleted = await db.$executeRawUnsafe(`
        DELETE FROM "Order"
        WHERE "status" = 'PENDING'
          AND COALESCE("total", 0) = 0
          AND ("items" IS NULL OR jsonb_array_length("items"::jsonb) = 0)
      `);

      return NextResponse.json({ success: true, mode: "cleanup-empty", deleted });
    }

    if (id) {
      await db.order.delete({ where: { id } });
      return NextResponse.json({ success: true, mode: "single" });
    }

    await db.order.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
