import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const admin = await prisma.adminUser.findFirst({ where: { email: 'admin@jpheritage.com' } })
  console.log('ADMIN:', admin)
}
main().catch(console.error).finally(() => prisma.$disconnect())
