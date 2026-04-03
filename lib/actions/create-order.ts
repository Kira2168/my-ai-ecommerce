"use server";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createOrderAction() {
  let orderId: string | null = null;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // 1. Create the record in your 'order' table
      const order = await db.order.create({
        data: {
          total: 0,
          status: "PENDING",
          items: [], // Stored as Json in your schema
        },
      });

      console.log("✅ Order initialized:", order.id);
      orderId = order.id;
      break;
    } catch (error) {
      console.error(`❌ Failed to create order (attempt ${attempt}/${maxAttempts}):`, error);

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        continue;
      }

      // Let the user know something went wrong without crashing the app
      throw new Error("Database connection failed. Please check your Neon connection.");
    }
  }

  // 2. Redirect MUST happen outside the try/catch block
  if (orderId) {
    redirect(`/shop?orderId=${orderId}`);
  }
}