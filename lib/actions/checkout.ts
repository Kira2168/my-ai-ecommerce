"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function processOrder(items: any[]) {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: "MANIFEST_EMPTY" };
    }

    // --- STOCK GUARD PROTOCOL ---
    // Check all items before starting the transaction
    for (const item of items) {
      const existingProduct = await prisma.product.findUnique({
        where: { id: item.id },
        select: { stock: true, name: true }
      });

      if (!existingProduct || existingProduct.stock < item.quantity) {
        return { 
          success: false, 
          error: `INSUFFICIENT_STOCK: ${existingProduct?.name || "Unknown Asset"}` 
        };
      }
    }

    // Execute Atomic Transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      )
    );

    revalidatePath("/shop");
    revalidatePath("/admin");
    revalidatePath(`/shop/[id]`, "page");

    return { success: true, message: "PROTOCOL_EXECUTED" };
  } catch (error) {
    console.error("TRANSACTION_FAILURE:", error);
    return { success: false, error: "NODE_SYNC_ERROR" };
  }
}