'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { updateUserFeatureOverrides } from '@/app/actions/admin-customers';
import {
  parseUserFeatureOverrides,
  type LoanMethodsOverrides,
} from '@/lib/feature-overrides';
import { BadgeDollarSign, Car, Home, Wallet, ShieldAlert, ShieldCheck, Building2, Key } from 'lucide-react';

export function AdminUserLoanOverrides({
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

  const loans = featureOverrides.loans;

  const handleGlobalToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    const updated = {
      ...featureOverrides,
      loans: {
        ...loans,
        enabled,
      },
    };
    setFeatureOverrides(updated);

    try {
      await updateUserFeatureOverrides(userId, { loans: updated.loans });
      toast.success(
        enabled
          ? 'Credit & Loan applications enabled for customer.'
          : 'Credit & Loan applications disabled for customer.'
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to update loan permissions.');
      setFeatureOverrides(featureOverrides);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMethodToggle = async (methodKey: keyof LoanMethodsOverrides, enabled: boolean) => {
    setIsUpdating(true);
    const updatedMethods: LoanMethodsOverrides = {
      ...loans.methods,
      [methodKey]: enabled,
    };
    const updated = {
      ...featureOverrides,
      loans: {
        ...loans,
        methods: updatedMethods,
      },
    };
    setFeatureOverrides(updated);

    try {
      await updateUserFeatureOverrides(userId, { loans: updated.loans });
      toast.success(`Loan product (${methodKey.toUpperCase()}) updated.`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update loan product permission.');
      setFeatureOverrides(featureOverrides);
    } finally {
      setIsUpdating(false);
    }
  };

  const loanProductsList: Array<{
    key: keyof LoanMethodsOverrides;
    name: string;
    description: string;
    icon: any;
  }> = [
    {
      key: 'auto',
      name: 'Bespoke Auto Loan',
      description: 'Luxury vehicles, exotic autos, and private collection financing up to $250,000',
      icon: Car,
    },
    {
      key: 'mortgage',
      name: 'Premier Jumbo Mortgage',
      description: 'First & secondary residential acquisition facilities up to $5,000,000',
      icon: Home,
    },
    {
      key: 'personal',
      name: 'Personal Reserve Line of Credit',
      description: 'Unsecured institutional liquidity and executive revolving facilities up to $100,000',
      icon: Wallet,
    },
    {
      key: 'heloc',
      name: 'Home Equity Line of Credit (HELOC)',
      description: 'Asset-backed residential liquidity draw facility up to $750,000',
      icon: Key,
    },
    {
      key: 'business',
      name: 'Commercial & Syndicate Term Loan',
      description: 'Corporate growth, enterprise expansion, and working capital lines up to $2,500,000',
      icon: Building2,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 p-6">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h4 className="text-lg font-display font-bold text-ink-900 flex items-center gap-2">
            <BadgeDollarSign className="w-5 h-5 text-vintage-gold" /> Customer Loan & Underwriting Controls
          </h4>
          <p className="text-sm text-neutral-500 mt-0.5">
            Control institutional lending access for this customer. Disabling a product blocks applications from being submitted in their e-portal.
          </p>
        </div>
      </div>

      {/* Global Toggle Banner */}
      <div className={`p-4 rounded-xl border transition-colors flex items-center justify-between ${
        loans.enabled 
          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
          : 'bg-rose-50/60 border-rose-200 text-rose-950'
      }`}>
        <div className="flex items-center gap-3">
          {loans.enabled ? (
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
              {loans.enabled ? 'Credit Application Center: ACTIVE' : 'Credit Application Center: RESTRICTED'}
            </h5>
            <p className="text-xs text-neutral-600">
              {loans.enabled
                ? 'Customer can apply for pre-approvals across permitted loan facilities.'
                : 'Customer is blocked from submitting any credit applications regardless of product settings.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider">
            {loans.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
          <Switch
            checked={loans.enabled}
            disabled={isUpdating}
            onCheckedChange={handleGlobalToggle}
          />
        </div>
      </div>

      {/* Products List */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
          Lending Product Clearances ({loanProductsList.filter(p => loans.methods[p.key]).length}/{loanProductsList.length} Permitted)
        </h5>
        <div className="grid grid-cols-1 gap-3">
          {loanProductsList.map((p) => {
            const Icon = p.icon;
            const isAllowed = loans.enabled && loans.methods[p.key];
            const isProductChecked = loans.methods[p.key];

            return (
              <div
                key={p.key}
                className={`border rounded-lg p-4 flex items-center justify-between transition-opacity ${
                  !loans.enabled ? 'opacity-50 bg-neutral-50' : 'bg-white hover:border-neutral-300'
                } border-neutral-200`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${isAllowed ? 'bg-amber-50 text-amber-800' : 'bg-neutral-100 text-neutral-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h6 className="font-semibold text-sm text-ink-900 flex items-center gap-2">
                      {p.name}
                      {!isAllowed && (
                        <span className="text-[10px] bg-neutral-100 text-neutral-600 font-bold px-2 py-0.5 rounded">
                          {!loans.enabled ? 'GLOBAL OFF' : 'BLOCKED'}
                        </span>
                      )}
                    </h6>
                    <p className="text-xs text-neutral-500 mt-0.5">{p.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${isAllowed ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    {isAllowed ? 'PERMITTED' : 'BLOCKED'}
                  </span>
                  <Switch
                    checked={isProductChecked}
                    disabled={isUpdating}
                    onCheckedChange={(val) => handleMethodToggle(p.key, val)}
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
