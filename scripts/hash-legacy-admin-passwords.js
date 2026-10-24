/**
 * One-off migration: replaces administrator passwords stored as plain text
 * with bcrypt hashes of the same value, so every admin keeps their current
 * password. Customer passwords are already hashed and are not touched.
 *
 * Without this, each admin row is upgraded automatically the first time that
 * admin signs in (see lib/password.ts); this script finishes the job at once.
 *
 * Usage (from the project root, with DATABASE_URL set):
 *   node --env-file=.env scripts/hash-legacy-admin-passwords.js           # dry run
 *   node --env-file=.env scripts/hash-legacy-admin-passwords.js --apply   # write
 *
 * Prints counts only — never passwords, hashes or email addresses.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$.{53}$/;
const apply = process.argv.includes('--apply');
const prisma = new PrismaClient();

(async () => {
  const admins = await prisma.adminUser.findMany({ select: { id: true, password: true } });
  const legacy = admins.filter((a) => !a.password || !BCRYPT_HASH.test(a.password));
  console.log(`${admins.length} admin accounts, ${legacy.length} with an unhashed password.`);

  if (!apply) {
    console.log('Dry run: nothing changed. Re-run with --apply to hash them.');
    return;
  }

  let updated = 0;
  for (const admin of legacy) {
    if (!admin.password) continue; // an empty password can't be preserved; reset it in the admin tools
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { password: await bcrypt.hash(admin.password, 12) },
    });
    updated += 1;
  }
  console.log(`Hashed ${updated} admin password(s).`);
})()
  .catch((e) => {
    console.error('Migration failed:', e.code || e.name);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
