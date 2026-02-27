// lib/db.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new Pool({ 
  connectionString,
  max: 1 // Important for Serverless environments to prevent "Too many connections"
});
const adapter = new PrismaPg(pool);

// In Prisma 7, we pass the 'adapter' instead of the config
export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;