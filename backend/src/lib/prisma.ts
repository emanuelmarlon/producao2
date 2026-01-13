import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
});

// Test connection
prisma.$connect()
    .then(() => console.log('✅ Database connected successfully'))
    .catch((error) => console.error('❌ Database connection failed:', error));
