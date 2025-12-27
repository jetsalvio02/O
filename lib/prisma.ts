import { PrismaClient } from "@prisma/client";
import { log } from "console";

const global_for_prisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  global_for_prisma.prisma ||
  new PrismaClient({
    log: ["query", "error"],
  });

if (process.env.NODE_ENV !== "production") global_for_prisma.prisma = prisma;
