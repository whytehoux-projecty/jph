import { prisma } from '@/lib/prisma';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { deleteUserPin, loginAsUser, toggleUserStatus, toggleUserTier, toggleUserOnlineAccess } from '@/app/actions/admin';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { decryptDeterministic } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

export default async function AllAccountHoldersPage() {
  const users = await prisma.user.findMany({
    where: {},
    orderBy: { createdAt: 'desc' },
    include: {
      accounts: {
        include: {
          cards: true,
          cheques: true,
          statements: {
            orderBy: { generatedAt: 'desc' },
            take: 10
          }
        }
      },
      registrationForm: true,
      beneficiaries: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const globalTransferMethods = await prisma.transferMethodConfig.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  const formattedUsers = users.map(user => {
    let registrationForm = user.registrationForm;
    if (registrationForm) {
      registrationForm = {
        ...registrationForm,
        ssnItin: registrationForm.ssnItin ? decryptDeterministic(registrationForm.ssnItin) : registrationForm.ssnItin,
        idNumber: registrationForm.idNumber ? decryptDeterministic(registrationForm.idNumber) : registrationForm.idNumber,
        ein: registrationForm.ein ? decryptDeterministic(registrationForm.ein) : registrationForm.ein,
        externalAccountNumber: registrationForm.externalAccountNumber ? decryptDeterministic(registrationForm.externalAccountNumber) : registrationForm.externalAccountNumber,
        externalAccountRoutingNumber: registrationForm.externalAccountRoutingNumber ? decryptDeterministic(registrationForm.externalAccountRoutingNumber) : registrationForm.externalAccountRoutingNumber,
      } as any;
    }
    return {
      ...user,
      registrationForm,
      cards: user.accounts.flatMap(acc => acc.cards),
      cheques: user.accounts.flatMap(acc => acc.cheques),
      statements: user.accounts.flatMap(acc => acc.statements)
    };
  });

  return (
    <AdminPageShell 
      title="All Account Holders" 
      subtitle="Manage all customer accounts across all statuses."
    >
      <AdminUserList 
        initialUsers={formattedUsers}
        globalTransferMethods={globalTransferMethods}
        onLoginAs={loginAsUser}
      />
    </AdminPageShell>
  );
}
