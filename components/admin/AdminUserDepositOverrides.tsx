'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { updateUserFeatureOverrides } from '@/app/actions/admin-customers';
import {
  parseUserFeatureOverrides,
  type DepositMethodsOverrides,
} from '@/lib/feature-overrides';
import { Landmark, ArrowDownToLine, Smartphone, CreditCard, Coins, ShieldAlert, ShieldCheck } from 'lucide-react';

export function AdminUserDepositOverrides({
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

  const deposits = featureOverrides.deposits;

  const handleGlobalToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    const updated = {
      ...featureOverrides,
      deposits: {
        ...deposits,
        enabled,
      },
    };
    setFeatureOverrides(updated);

    try {
      await updateUserFeatureOverrides(userId, { deposits: updated.deposits });
      toast.success(
        enabled
          ? 'Deposit facilities enabled for customer.'
          : 'Deposit facilities disabled for customer.'
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to update deposit permissions.');
      setFeatureOverrides(featureOverrides);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMethodToggle = async (methodKey: keyof DepositMethodsOverrides, enabled: boolean) => {
    setIsUpdating(true);
    const updatedMethods: DepositMethodsOverrides = {
      ...deposits.methods,
      [methodKey]: enabled,
    };
    const updated = {
      ...featureOverrides,
      deposits: {
        ...deposits,
        methods: updatedMethods,
      },
    };
    setFeatureOverrides(updated);

    try {
      await updateUserFeatureOverrides(userId, { deposits: updated.deposits });
      toast.success(`Deposit method (${methodKey.toUpperCase()}) updated.`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update deposit method.');
      setFeatureOverrides(featureOverrides);
    } finally {
      setIsUpdating(false);
    }
  };

  const methodsList: Array<{
    key: keyof DepositMethodsOverrides;
    name: string;
    description: string;
    icon: any;
  }> = [
    {
      key: 'cash',
      name: 'Direct Cash Deposit',
      description: 'Physical vault drops & Smart ATM barcode cash clearing',
      icon: Landmark,
    },
    {
      key: 'virtual',
      name: 'Third-Party / Virtual ACH',
      description: 'Inbound external ACH transfers & direct routing credentials',
      icon: ArrowDownToLine,
    },
    {
      key: 'check',
      name: 'Mobile Check Deposit',
      description: 'Front & back cheque camera imaging and optical clearance',
      icon: Smartphone,
    },
    {
      key: 'card',
      name: 'Debit/Credit Card Top-Up',
      description: 'Instant card acquiring pipeline and tokenized debit deposits',
      icon: CreditCard,
    },
    {
      key: 'crypto',
      name: 'USDC/USDT Stablecoin Deposit',
      description: 'Multi-chain institutional treasury addresses (ETH, SOL, TRON, POLYGON)',
      icon: Coins,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 p-6">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h4 className="text-lg font-display font-bold text-ink-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-vintage-gold" /> Customer Deposit Controls
          </h4>
          <p className="text-sm text-neutral-500 mt-0.5">
            Granular access controls for this account holder. Disabling an option blocks both the customer UI and backend execution.
          </p>
        </div>
      </div>

      {/* Global Toggle Banner */}
      <div className={`p-4 rounded-xl border transition-colors flex items-center justify-between ${
        deposits.enabled 
          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
          : 'bg-rose-50/60 border-rose-200 text-rose-950'
      }`}>
        <div className="flex items-center gap-3">
          {deposits.enabled ? (
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
              {deposits.enabled ? 'Deposit Services: ACTIVE' : 'Deposit Services: RESTRICTED'}
            </h5>
            <p className="text-xs text-neutral-600">
              {deposits.enabled
                ? 'Customer has clearance to initiate deposits on enabled methods.'
                : 'Customer is blocked from initiating any deposits regardless of individual method settings.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider">
            {deposits.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
          <Switch
            checked={deposits.enabled}
            disabled={isUpdating}
            onCheckedChange={handleGlobalToggle}
          />
        </div>
      </div>

      {/* Methods List */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
          Deposit Methods Clearance ({methodsList.filter(m => deposits.methods[m.key]).length}/{methodsList.length} Enabled)
        </h5>
        <div className="grid grid-cols-1 gap-3">
          {methodsList.map((m) => {
            const Icon = m.icon;
            const isAllowed = deposits.enabled && deposits.methods[m.key];
            const isMethodChecked = deposits.methods[m.key];

            return (
              <div
                key={m.key}
                className={`border rounded-lg p-4 flex items-center justify-between transition-opacity ${
                  !deposits.enabled ? 'opacity-50 bg-neutral-50' : 'bg-white hover:border-neutral-300'
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
                          {!deposits.enabled ? 'GLOBAL OFF' : 'BLOCKED'}
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
