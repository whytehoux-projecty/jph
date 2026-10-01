import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'admin@gmail.com' } })
  console.log('e-banking user:', user?.hasOnlineAccess, user?.eportalStatus)
}
main().catch(console.error).finally(() => prisma.$disconnect())
