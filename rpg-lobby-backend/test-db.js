const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    const users = await prisma.user.findMany();
    console.log('Conexão bem-sucedida! Usuários:', users);
  } catch (error) {
    console.error('Erro ao conectar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();