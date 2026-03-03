// lib/db.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

function normalizeSslMode(urlString: string | undefined) {
  if (!urlString) return urlString;

  try {
    const parsed = new URL(urlString);
    const sslMode = parsed.searchParams.get("sslmode");

    if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
      parsed.searchParams.set("sslmode", "verify-full");
      return parsed.toString();
    }

    return urlString;
  } catch {
    return urlString;
  }
}

// Debugging check: this will show in your terminal if the ENV is missing
if (!connectionString) {
  console.error("❌ DATABASE_URL is not defined in environment variables!");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const normalizedConnectionString = normalizeSslMode(connectionString);

const pool = new Pool({ 
  connectionString: normalizedConnectionString,
  max: 1 
});
const adapter = new PrismaPg(pool);

export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;