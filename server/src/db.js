// One shared Prisma client for the whole server.
// Prisma 7 talks to Postgres through a "driver adapter" (here: the `pg` driver).
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
