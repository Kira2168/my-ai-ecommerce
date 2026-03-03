"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
// import { generateText } from "ai"; 
// import { openai } from "@ai-sdk/openai"; 

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const rawDescription = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;

  // --- AI BYPASSED FOR NOW ---
  // We'll use a placeholder until you add your API Key
  const aiTags = ["Tech", "Future", "New"]; 
  // ---------------------------

  try {
    await db.product.create({
      data: {
        name,
        description: rawDescription,
        price,
        category,
        aiTags,
        image: "/placeholder.png",
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false };
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.product.delete({
      where: { id },
    });
    revalidatePath("/admin"); 
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}