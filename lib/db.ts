// lib/db.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

// Debugging check: this will show in your terminal if the ENV is missing
if (!connectionString) {
  console.error("❌ DATABASE_URL is not defined in environment variables!");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const pool = new Pool({ 
  connectionString,
  ssl: connectionString?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
  max: 1 
});
const adapter = new PrismaPg(pool);

export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;