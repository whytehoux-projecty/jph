import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default function SystemSettingsPage() {
  return (
    <AdminPageShell 
      title="System Settings" 
      subtitle="Configure global platform settings, environment variables, and integrations."
    >
      <div className="p-6">
        <div className="mt-8 border border-dashed border-neutral-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-neutral-50">
          <h3 className="text-lg font-semibold text-charcoal mb-2">System Settings</h3>
          <p className="text-muted-foreground max-w-md">Global configuration options are currently managed via environment variables and direct database updates.</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
