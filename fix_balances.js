const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const accounts = await prisma.account.findMany({ include: { transactions: true } });
  for (let acc of accounts) {
    const sum = acc.transactions.reduce((s, t) => s + (t.type === 'CREDIT' ? t.amount : -Math.abs(t.amount)), 0);
    await prisma.account.update({ where: { id: acc.id }, data: { balance: sum } });
  }
  console.log('Balances updated');
}
main().catch(console.error).finally(() => prisma.$disconnect());
