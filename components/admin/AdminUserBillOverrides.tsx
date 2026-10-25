'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { updateUserFeatureOverrides } from '@/app/actions/admin-customers';
import {
  parseUserFeatureOverrides,
  type BillMethodsOverrides,
} from '@/lib/feature-overrides';
import { ReceiptText, Building2, FileText, ShieldAlert, ShieldCheck } from 'lucide-react';

export function AdminUserBillOverrides({
  userId,
  initialOverridesJson,
}: {
  userId: string;
  initialOverridesJson: string | null;
}) {
  const [featureOverrides, setFeatureOverrides] = useState(() =>
    parseUserFeatureOverrides(initialOverridesJson)
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const bills = featureOverrides.bills;

  const handleGlobalToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    const updated = {
      ...featureOverrides,
      bills: {
        ...bills,
        enabled,
      },
    };
    setFeatureOverrides(updated);

    try {
      await updateUserFeatureOverrides(userId, { bills: updated.bills });
      toast.success(
        enabled
          ? 'Bill payment services enabled for customer.'
          : 'Bill payment services disabled for customer.'
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to update bill payment permissions.');
      setFeatureOverrides(featureOverrides);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMethodToggle = async (methodKey: keyof BillMethodsOverrides, enabled: boolean) => {
    setIsUpdating(true);
    const updatedMethods: BillMethodsOverrides = {
      ...bills.methods,
      [methodKey]: enabled,
    };
    const updated = {
      ...featureOverrides,
      bills: {
        ...bills,
        methods: updatedMethods,
      },
    };
    setFeatureOverrides(updated);

    try {
      await updateUserFeatureOverrides(userId, { bills: updated.bills });
      toast.success(`Bill settlement method (${methodKey.toUpperCase()}) updated.`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update bill payment method.');
      setFeatureOverrides(featureOverrides);
    } finally {
      setIsUpdating(false);
    }
  };

  const methodsList: Array<{
    key: keyof BillMethodsOverrides;
    name: string;
    description: string;
    icon: any;
  }> = [
    {
      key: 'providers',
      name: 'Pay Saved Billers',
      description: 'Customer pays billers saved for them; each payment is reviewed by staff before it is sent',
      icon: Building2,
    },
    {
      key: 'einvoice',
      name: 'Attach a Copy of the Bill',
      description: 'Customer can attach a PDF or photo of the bill to a payment, stored privately for staff review',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 p-6">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h4 className="text-lg font-display font-bold text-ink-900 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-vintage-gold" /> Customer Bill Payment Controls
          </h4>
          <p className="text-sm text-neutral-500 mt-0.5">
            Granular access controls for bill settlements. Disabling an option blocks customer UI execution and rejects unauthorized payment submissions.
          </p>
        </div>
      </div>

      {/* Global Toggle Banner */}
      <div className={`p-4 rounded-xl border transition-colors flex items-center justify-between ${
        bills.enabled 
          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
          : 'bg-rose-50/60 border-rose-200 text-rose-950'
      }`}>
        <div className="flex items-center gap-3">
          {bills.enabled ? (
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
          )}
          <div>
            <h5 className="font-bold text-sm">
              {bills.enabled ? 'Bill Pay Services: ACTIVE' : 'Bill Pay Services: RESTRICTED'}
            </h5>
            <p className="text-xs text-neutral-600">
              {bills.enabled
                ? 'Customer has clearance to schedule and dispatch bill payments on authorized rails.'
                : 'Customer is blocked from initiating any bill settlements regardless of individual method settings.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider">
            {bills.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
          <Switch
            checked={bills.enabled}
            disabled={isUpdating}
            onCheckedChange={handleGlobalToggle}
          />
        </div>
      </div>

      {/* Methods List */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
          Payment Method Clearance ({methodsList.filter(m => bills.methods[m.key]).length}/{methodsList.length} Enabled)
        </h5>
        <div className="grid grid-cols-1 gap-3">
          {methodsList.map((m) => {
            const Icon = m.icon;
            const isAllowed = bills.enabled && bills.methods[m.key];
            const isMethodChecked = bills.methods[m.key];

            return (
              <div
                key={m.key}
                className={`border rounded-lg p-4 flex items-center justify-between transition-opacity ${
                  !bills.enabled ? 'opacity-50 bg-neutral-50' : 'bg-white hover:border-neutral-300'
                } border-neutral-200`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${isAllowed ? 'bg-amber-50 text-amber-800' : 'bg-neutral-100 text-neutral-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h6 className="font-semibold text-sm text-ink-900 flex items-center gap-2">
                      {m.name}
                      {!isAllowed && (
                        <span className="text-[10px] bg-neutral-100 text-neutral-600 font-bold px-2 py-0.5 rounded">
                          {!bills.enabled ? 'GLOBAL OFF' : 'BLOCKED'}
                        </span>
                      )}
                    </h6>
                    <p className="text-xs text-neutral-500 mt-0.5">{m.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${isAllowed ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    {isAllowed ? 'PERMITTED' : 'BLOCKED'}
                  </span>
                  <Switch
                    checked={isMethodChecked}
                    disabled={isUpdating}
                    onCheckedChange={(val) => handleMethodToggle(m.key, val)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
