/**
 * One-off migration: revokes the shared default password ("Welcome123!")
 * that registration used to give every new customer.
 *
 * For each customer whose password still matches it:
 *   - with online access: issues a unique temporary password, forces the
 *     first-sign-in flow (new password + PIN), and makes the temporary
 *     password visible to staff in Admin → Customers → Account holders so it
 *     can be passed on through a verified channel. Nothing is emailed or
 *     printed by this script.
 *   - without online access: replaces it with an unusable random hash; real
 *     credentials are issued when access is approved.
 *
 * Usage (from the project root, with DATABASE_URL set):
 *   node --env-file=.env scripts/revoke-default-passwords.js           # dry run
 *   node --env-file=.env scripts/revoke-default-passwords.js --apply   # write
 *
 * Prints counts only — never passwords, hashes or customer details.
 */
const { randomBytes, randomInt } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const LEGACY_DEFAULT = 'Welcome123!';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$*!';
const apply = process.argv.includes('--apply');
const prisma = new PrismaClient();

const temporaryPassword = () =>
  Array.from({ length: 14 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

(async () => {
  const users = await prisma.user.findMany({ select: { id: true, password: true, hasOnlineAccess: true } });
  const affected = [];
  for (const u of users) {
    if (await bcrypt.compare(LEGACY_DEFAULT, u.password).catch(() => false)) affected.push(u);
  }
  const live = affected.filter((u) => u.hasOnlineAccess);
  console.log(`${users.length} customers; ${affected.length} still on the shared default password, ${live.length} of them with online access.`);

  if (!apply) {
    console.log('Dry run: nothing changed. Re-run with --apply to revoke them.');
    return;
  }

  for (const u of affected) {
    if (u.hasOnlineAccess) {
      const temp = temporaryPassword();
      await prisma.user.update({
        where: { id: u.id },
        data: { password: await bcrypt.hash(temp, 12), temporaryPassword: temp, isFirstLogin: true },
      });
    } else {
      await prisma.user.update({
        where: { id: u.id },
        data: { password: await bcrypt.hash(randomBytes(32).toString('base64url'), 12) },
      });
    }
  }
  console.log(`Revoked ${affected.length}. ${live.length} customer(s) need their new temporary password from staff.`);
})()
  .catch((e) => {
    console.error('Migration failed:', e.code || e.name);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
