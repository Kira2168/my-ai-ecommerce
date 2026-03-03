"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type OrderItemPayload = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  category?: string;
};

/**
 * INITIALIZES A NEW DRAFT RECORD IN THE DATABASE
 */
export async function createDraftOrder() {
  try {
    const order = await db.order.create({
      data: {
        total: 0,
        status: "PENDING",
        items: [],
      },
    });

    // Notify admin of a new potential transmission
    revalidatePath("/admin"); 

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("ORDER_INIT_FAILURE:", error);
    return { success: false, error: "ORDER_INIT_ERROR" };
  }
}

/**
 * ADDS OR INCREMENTS AN ITEM IN THE DATABASE JSON
 */
export async function addItemToOrder(orderId: string, product: OrderItemPayload) {
  try {
    // 1. STRENGTHENED PAYLOAD VALIDATION
    if (!orderId || !product?.id) {
      console.warn("SYNC_REJECTED: Missing OrderID or ProductID");
      return { success: false, error: "INVALID_PAYLOAD" };
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { items: true, total: true },
    });

    if (!order) return { success: false, error: "ORDER_NOT_FOUND" };

    const existingItems = Array.isArray(order.items) ? (order.items as any[]) : [];
    
    // 2. ROBUST QUANTITY HANDLING
    const existingIndex = existingItems.findIndex((item) => item.id === product.id);
    let nextItems: any[];

    if (existingIndex >= 0) {
      nextItems = [...existingItems];
      // Ensure we have a valid number before adding
      const currentQty = parseInt(nextItems[existingIndex].quantity) || 1;
      nextItems[existingIndex] = {
        ...nextItems[existingIndex],
        quantity: currentQty + 1,
      };
    } else {
      nextItems = [
        ...existingItems,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image ?? null,
          category: product.category ?? "Unknown",
          quantity: 1,
        },
      ];
    }

    // 3. CALCULATION SAFETY (Prevents NaN in Total)
    const productPrice = Number(product.price) || 0;
    const currentTotal = Number(order.total) || 0;
    const nextTotal = currentTotal + productPrice;

    await db.order.update({
      where: { id: orderId },
      data: {
        items: nextItems,
        total: nextTotal,
      },
    });

    // 4. CACHE REVALIDATION
    // Force the admin command center to refresh the "Live Carts" and "Transmission Log"
    revalidatePath("/admin"); 
    revalidatePath("/"); 

    return { success: true };
  } catch (error) {
    console.error("ORDER_SYNC_FAILURE:", error);
    return { success: false, error: "ORDER_SYNC_ERROR" };
  }
}

/**
 * FINALIZES THE ORDER: UPDATES STOCK AND SETS ORDER STATUS TO COMPLETED
 */
export async function processOrder(items: any[], orderId?: string | null) {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: "MANIFEST_EMPTY" };
    }

    // 1. --- STOCK GUARD PROTOCOL ---
    for (const item of items) {
      const existingProduct = await db.product.findUnique({
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

    // 2. --- ATOMIC TRANSACTION ---
    await db.$transaction([
      ...items.map((item) =>
        db.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      ),
      ...(orderId ? [
        db.order.update({
          where: { id: orderId },
          data: { 
            status: "COMPLETED",
            items: items // Final snapshot of items
          },
        })
      ] : [])
    ]);

    // 3. --- SYSTEM-WIDE REVALIDATION ---
    revalidatePath("/shop");
    revalidatePath("/admin");
    revalidatePath(`/shop/[id]`, "page");

    return { success: true, message: "PROTOCOL_EXECUTED" };
  } catch (error) {
    console.error("TRANSACTION_FAILURE:", error);
    return { success: false, error: "NODE_SYNC_ERROR" };
  }
}