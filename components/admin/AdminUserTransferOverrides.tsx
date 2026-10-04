'use client';

import { useState } from 'react';
import { TransferMethodConfig } from '@prisma/client';
import { ShieldCheck, ShieldAlert, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { updateUserTransferOverrides } from '@/app/actions/admin-customers';
import { toast } from 'sonner';

export function AdminUserTransferOverrides({
  userId,
  globalTransferMethods,
  initialOverridesJson,
}: {
  userId: string;
  globalTransferMethods: TransferMethodConfig[];
  initialOverridesJson: string | null;
}) {
  const [overrides, setOverrides] = useState<Record<string, { enabled: boolean }>>(() => {
    try {
      return initialOverridesJson ? JSON.parse(initialOverridesJson) : {};
    } catch {
      return {};
    }
  });

  const handleToggle = async (methodId: string, enabled: boolean) => {
    const newOverrides = { ...overrides, [methodId]: { enabled } };
    setOverrides(newOverrides);
    try {
      await updateUserTransferOverrides(userId, JSON.stringify(newOverrides));
      toast.success('Transfer method settings updated.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update transfer overrides.');
      setOverrides(overrides); // Revert
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 p-6">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-display font-bold text-(--ink-900)">Customer Transfer Restrictions</h4>
      </div>
      <p className="text-sm text-neutral-500 max-w-3xl">
        Manage which transfer methods this specific user is permitted to use. If a method is toggled OFF here, they will see it locked in their e-bank portal, even if it is enabled globally.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {globalTransferMethods.map((method) => {
          // If the method is disabled globally, we might want to still let admin override?
          // Actually if it's disabled globally, nobody can use it.
          const override = overrides[method.methodId];
          const isEnabled = override ? override.enabled : true;

          return (
            <div key={method.id} className="bg-white border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h5 className="font-bold flex items-center gap-2">
                  {method.displayName}
                  {!method.isEnabled && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Globally Disabled</span>}
                </h5>
                <p className="text-xs text-neutral-500 mt-1">{method.methodId}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-neutral-400">
                  {isEnabled ? 'ALLOWED' : 'BLOCKED'}
                </span>
                <Switch 
                  checked={isEnabled}
                  onCheckedChange={(c) => handleToggle(method.methodId, c)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
