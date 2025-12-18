import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

if (process.env.VERCEL && (!databaseUrl || databaseUrl.includes('localhost'))) {
  throw new Error('DATABASE_URL is not set or points to localhost. Please set a production database URL in Vercel environment variables.');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;