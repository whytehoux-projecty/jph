import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@gmail.com' } })
  console.log('User:', user ? 'Found' : 'Not found')
  const admin = await prisma.adminUser.findUnique({ where: { email: 'admin@gmail.com' } })
  console.log('Admin:', admin ? 'Found' : 'Not found')
}
main().catch(console.error).finally(() => prisma.$disconnect())
