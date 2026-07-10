import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.healspacePrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.healspacePrisma = prisma;
}
