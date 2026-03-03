"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteProduct(id: string) {
  try {
    await db.product.delete({
      where: { id },
    });
    
    // This is the most important part to make it disappear from /shop
    revalidatePath("/shop"); 
    revalidatePath("/admin");
    revalidatePath("/", "layout"); // Clears any global layouts that might cache the list
    
    return { success: true };
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    return { success: false };
  }
}