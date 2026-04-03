// lib/db.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

function normalizeConnectionUrl(urlString: string | undefined) {
  if (!urlString) return urlString;

  try {
    const parsed = new URL(urlString);
    const sslMode = parsed.searchParams.get("sslmode");

    if (sslMode === "require" && !parsed.searchParams.has("uselibpqcompat")) {
      parsed.searchParams.set("uselibpqcompat", "true");
    }

    return parsed.toString();
  } catch {
    return urlString;
  }
}

// Debugging check: this will show in your terminal if the ENV is missing
if (!connectionString) {
  console.error("❌ DATABASE_URL is not defined in environment variables!");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const normalizedConnectionString = normalizeConnectionUrl(connectionString);

const pool = new Pool({
  connectionString: normalizedConnectionString,
  max: 5,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  ssl: normalizedConnectionString?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});

const adapter = new PrismaPg(pool);

export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;