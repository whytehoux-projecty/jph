import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user1 = await prisma.user.findFirst({ where: { email: 'admin@gmail.com' } })
  console.log('e-banking user (admin@gmail.com):', user1 ? 'FOUND' : 'NOT FOUND')
  
  const admin1 = await prisma.adminUser.findFirst({ where: { email: 'admin@gmail.com' } })
  console.log('admin user (admin@gmail.com):', admin1 ? 'FOUND' : 'NOT FOUND')
  
  const user2 = await prisma.user.findFirst({ where: { email: 'admin@jpheritage.com' } })
  console.log('e-banking user (admin@jpheritage.com):', user2 ? 'FOUND' : 'NOT FOUND')
  
  const admin2 = await prisma.adminUser.findFirst({ where: { email: 'admin@jpheritage.com' } })
  console.log('admin user (admin@jpheritage.com):', admin2 ? 'FOUND' : 'NOT FOUND')
}
main().catch(console.error).finally(() => prisma.$disconnect())
