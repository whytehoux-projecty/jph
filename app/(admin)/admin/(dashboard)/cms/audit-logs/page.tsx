import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default function AuditLogsPage() {
  return (
    <AdminPageShell 
      title="Audit Logs" 
      subtitle="Review system activity, logins, and administrative actions."
    >
      <div className="p-6">
        <div className="mt-8 border border-dashed border-neutral-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-neutral-50">
          <h3 className="text-lg font-semibold text-charcoal mb-2">Audit Logs</h3>
          <p className="text-muted-foreground max-w-md">The audit logging system is currently under development. Activity tracking will appear here.</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
