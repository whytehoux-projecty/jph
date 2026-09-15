import { prisma } from '@/lib/prisma';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { deleteUserPin, loginAsUser, toggleUserStatus, toggleUserTier } from '@/app/actions/admin';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      accounts: {
        select: {
          id: true,
          accountNumber: true,
          accountType: true,
          balance: true,
          status: true,
        }
      }
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Customer Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage user access, tiers, and view linked accounts.</p>
        </div>
      </div>

      <AdminUserList 
        initialUsers={users}
        onToggleStatus={toggleUserStatus}
        onToggleTier={toggleUserTier}
        onDeletePin={deleteUserPin}
        onLoginAs={loginAsUser}
      />
    </div>
  );
}
