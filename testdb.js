const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const apps = await prisma.accountApplication.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log(apps.map(app => ({
    id: app.id,
    name: app.firstName,
    status: app.status,
    token: app.registrationToken
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
