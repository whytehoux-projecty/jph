import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'admin@gmail.com' } })
  if (user) {
    const password = '78901234@Plc'
    const passwordsMatch = await bcrypt.compare(password, user.password).catch(() => false);
    console.log('User password matches bcrypt?', passwordsMatch)
    console.log('User password matches direct?', password === user.password)
    console.log('User password hash in DB:', user.password)
  }

  const admin = await prisma.adminUser.findFirst({ where: { email: 'admin@jpheritage.com' } })
  if (admin) {
    const password = 'Admin123!'
    const passwordsMatch = await bcrypt.compare(password, admin.password).catch(() => false);
    console.log('Admin password matches bcrypt?', passwordsMatch)
    console.log('Admin password matches direct?', password === admin.password)
    console.log('Admin password hash in DB:', admin.password)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
