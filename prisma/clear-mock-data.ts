import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing mocked data from JPHeritage database (preserving Admin users)...');

  // Wipe existing records cleanly
  await prisma.statement.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.payee.deleteMany();
  await prisma.card.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.accountApplication.deleteMany();
  await prisma.onlineAccessRequest.deleteMany();
  await prisma.user.deleteMany();
  
  // NOTE: We do NOT delete admin users.
  // await prisma.adminUser.deleteMany();

  console.log('Mocked data successfully cleared. Admin portal is ready for real data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
