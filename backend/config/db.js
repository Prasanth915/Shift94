import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient instance to ensure a single connection pool
 * is shared across the entire backend application lifecycle.
 */
const prisma = new PrismaClient();

export default prisma;
