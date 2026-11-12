const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

let prisma;

function getPrisma() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL no está configurada.');
    error.code = 'DATABASE_URL_MISSING';
    throw error;
  }

  if (!prisma) {
    try {
      const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL
      });

      prisma = new PrismaClient({ adapter });
    } catch (cause) {
      const error = new Error('DATABASE_URL no contiene una configuración válida.');
      error.code = 'DATABASE_URL_INVALID';
      error.cause = cause;
      throw error;
    }
  }

  return prisma;
}

module.exports = getPrisma;
