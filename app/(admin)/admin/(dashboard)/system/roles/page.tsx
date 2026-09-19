import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default function RolesPermissionsPage() {
  return (
    <AdminPageShell 
      title="Roles & Permissions" 
      subtitle="Configure access control lists and role capabilities."
    >
      <div className="p-6">
        <div className="mt-8 border border-dashed border-neutral-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-neutral-50">
          <h3 className="text-lg font-semibold text-charcoal mb-2">Roles & Permissions</h3>
          <p className="text-muted-foreground max-w-md">Role-Based Access Control (RBAC) UI is currently under development. All admins have full access by default.</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
