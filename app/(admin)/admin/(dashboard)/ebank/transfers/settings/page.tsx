import { getTransferMethodConfigs, updateTransferMethodConfig } from '@/app/actions/transferConfig';
import { AdminTransferSettings } from '@/components/admin/AdminTransferSettings';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TransfersSettingsPage() {
  const configs = await getTransferMethodConfigs();

  return (
    <AdminPageShell 
      title="Transfer Methods" 
      subtitle="Configure available payment rails, limits, fees, and rules."
      action={
        <Link 
          href="/admin/ebank/transfers" 
          className="flex items-center gap-2 px-4 py-2 bg-white text-ink-900 border border-neutral-200 rounded-md text-sm font-medium hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </Link>
      }
    >
      <AdminTransferSettings configs={configs} onSave={updateTransferMethodConfig} />
    </AdminPageShell>
  );
}
