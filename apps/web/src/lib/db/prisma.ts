import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper pour multi-tenancy
export function getTenantPrisma(tenantId: string) {
  // Ici on pourrait implémenter une logique de routing par tenant
  // Pour l'instant on utilise le même client avec filtrage
  return prisma;
}