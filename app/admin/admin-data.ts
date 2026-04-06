import { db } from "@/lib/db";

type AdminProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string | null;
  category: string;
  description: string;
  createdAt: Date;
};

type AdminOrder = {
  id: string;
  total: number;
  status: string;
  items: any[];
  createdAt: Date;
};

export async function getProductsSafe(): Promise<AdminProduct[]> {
  try {
    const rows = await db.product.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price ?? 0),
      stock: Number((row as any).stock ?? 0),
      image: ((row as any).image ?? null) as string | null,
      category: String((row as any).category ?? "TECH"),
      description: String((row as any).description ?? ""),
      createdAt: (row as any).createdAt ? new Date((row as any).createdAt) : new Date(0),
    }));
  } catch (error) {
    console.error("ADMIN_PRODUCT_FETCH_FAILED:", error);

    const cols = await db.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Product'
    `;

    const set = new Set(cols.map((c) => c.column_name));
    const selectParts = [
      set.has("id") ? `"id"` : `''::text AS "id"`,
      set.has("name") ? `"name"` : `''::text AS "name"`,
      set.has("price") ? `"price"` : `0::double precision AS "price"`,
      set.has("stock") ? `"stock"` : `0::integer AS "stock"`,
      set.has("image") ? `"image"` : `NULL::text AS "image"`,
      set.has("category") ? `"category"` : `'TECH'::text AS "category"`,
      set.has("description") ? `"description"` : `''::text AS "description"`,
      set.has("createdAt") ? `"createdAt"` : `NOW() AS "createdAt"`,
    ];

    const orderBy = set.has("createdAt") ? ` ORDER BY "createdAt" DESC` : "";
    const query = `SELECT ${selectParts.join(", ")} FROM "Product"${orderBy}`;
    const rows = await db.$queryRawUnsafe<any[]>(query);

    return rows.map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? "UNKNOWN"),
      price: Number(row.price ?? 0),
      stock: Number(row.stock ?? 0),
      image: (row.image ?? null) as string | null,
      category: String(row.category ?? "TECH"),
      description: String(row.description ?? ""),
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(0),
    }));
  }
}

export async function getOrdersSafe(): Promise<AdminOrder[]> {
  try {
    const rows = await db.order.findMany({ orderBy: { createdAt: "desc" }, take: 60 });
    return rows
      .map((row) => ({
      id: row.id,
      total: Number(row.total ?? 0),
      status: row.status ?? "PENDING",
      items: Array.isArray(row.items) ? (row.items as any[]) : [],
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(0),
      }))
      .filter((row) => row.status !== "PENDING" || row.items.length > 0 || row.total > 0);
  } catch (error) {
    console.error("ADMIN_ORDER_FETCH_FAILED:", error);

    const cols = await db.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Order'
    `;

    const set = new Set(cols.map((c) => c.column_name));
    const selectParts = [
      set.has("id") ? `"id"` : `''::text AS "id"`,
      set.has("total") ? `"total"` : `0::double precision AS "total"`,
      set.has("status") ? `"status"` : `'PENDING'::text AS "status"`,
      set.has("items") ? `"items"` : `'[]'::jsonb AS "items"`,
      set.has("createdAt") ? `"createdAt"` : `NOW() AS "createdAt"`,
    ];

    const orderBy = set.has("createdAt") ? ` ORDER BY "createdAt" DESC` : "";
    const query = `SELECT ${selectParts.join(", ")} FROM "Order"${orderBy} LIMIT 60`;
    const rows = await db.$queryRawUnsafe<any[]>(query);

    return rows
      .map((row) => ({
      id: String(row.id ?? ""),
      total: Number(row.total ?? 0),
      status: String(row.status ?? "PENDING"),
      items: Array.isArray(row.items) ? row.items : [],
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(0),
      }))
      .filter((row) => row.status !== "PENDING" || row.items.length > 0 || row.total > 0);
  }
}
