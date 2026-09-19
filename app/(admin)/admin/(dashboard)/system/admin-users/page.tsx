import { prisma } from '@/lib/prisma';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminPageShell 
      title="Admin Users" 
      subtitle="Manage staff accounts and administrative access."
    >
      <div className="p-6">
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-neutral-50/50">
                  <td className="px-4 py-3 font-medium text-charcoal">{admin.firstName} {admin.lastName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(admin.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No admin users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  );
}
