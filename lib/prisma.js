import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL;

console.log('DATABASE_URL exists:', !!connectionString);

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

console.log('DATABASE_URL exists:', !!connectionString);

const adapter = new PrismaNeon({ connectionString });

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}