'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { updateUserFeatureOverrides } from '@/app/actions/admin-customers';
import {
  parseUserFeatureOverrides,
  type BenefitsMethodsOverrides,
} from '@/lib/feature-overrides';
import { Gift, Briefcase, ShieldAlert, ShieldCheck } from 'lucide-react';

export function AdminUserBenefitOverrides({
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

  const benefits = featureOverrides.benefits;

  const handleGlobalToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    const updated = {
      ...featureOverrides,
      benefits: {
        ...benefits,
        enabled,
      },
    };
    setFeatureOverrides(updated);

    try {
      await updateUserFeatureOverrides(userId, { benefits: updated.benefits });
      toast.success(
        enabled
          ? 'Rewards & Benefits enabled for customer.'
          : 'Rewards & Benefits disabled for customer.'
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to update benefits permissions.');
      setFeatureOverrides(featureOverrides);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMethodToggle = async (methodKey: keyof BenefitsMethodsOverrides, enabled: boolean) => {
    setIsUpdating(true);
    const updatedMethods: BenefitsMethodsOverrides = {
      ...benefits.methods,
      [methodKey]: enabled,
    };
    const updated = {
      ...featureOverrides,
      benefits: {
        ...benefits,
        methods: updatedMethods,
      },
    };
    setFeatureOverrides(updated);

    try {
      await updateUserFeatureOverrides(userId, { benefits: updated.benefits });
      toast.success(`Benefit feature (${methodKey.replace('_', ' ').toUpperCase()}) updated.`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update benefit feature.');
      setFeatureOverrides(featureOverrides);
    } finally {
      setIsUpdating(false);
    }
  };

  const benefitsList: Array<{
    key: keyof BenefitsMethodsOverrides;
    name: string;
    description: string;
    icon: any;
  }> = [
    {
      key: 'private_advisory',
      name: 'Advisory Meeting Requests',
      description: 'Customer can ask for a meeting from Your relationship; requests arrive in E-bank › Benefits for staff to arrange',
      icon: Briefcase,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 p-6">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h4 className="text-lg font-display font-bold text-ink-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-vintage-gold" /> Customer Rewards & Benefits Controls
          </h4>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage loyalty points conversion, relationship tier perks, advisory bookings, and lifestyle concierge access.
          </p>
        </div>
      </div>

      {/* Global Toggle Banner */}
      <div className={`p-4 rounded-xl border transition-colors flex items-center justify-between ${
        benefits.enabled 
          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
          : 'bg-rose-50/60 border-rose-200 text-rose-950'
      }`}>
        <div className="flex items-center gap-3">
          {benefits.enabled ? (
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
              {benefits.enabled ? 'Benefits & Rewards: ACTIVE' : 'Benefits & Rewards: RESTRICTED'}
            </h5>
            <p className="text-xs text-neutral-600">
              {benefits.enabled
                ? 'Customer can access relationship perks and submit redemptions on permitted features.'
                : 'Customer is blocked from redeeming points, booking advisory, or requesting concierge.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider">
            {benefits.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
          <Switch
            checked={benefits.enabled}
            disabled={isUpdating}
            onCheckedChange={handleGlobalToggle}
          />
        </div>
      </div>

      {/* Benefits List */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
          Relationship Features ({benefitsList.filter(b => benefits.methods[b.key]).length}/{benefitsList.length} Permitted)
        </h5>
        <div className="grid grid-cols-1 gap-3">
          {benefitsList.map((b) => {
            const Icon = b.icon;
            const isAllowed = benefits.enabled && benefits.methods[b.key];
            const isMethodChecked = benefits.methods[b.key];

            return (
              <div
                key={b.key}
                className={`border rounded-lg p-4 flex items-center justify-between transition-opacity ${
                  !benefits.enabled ? 'opacity-50 bg-neutral-50' : 'bg-white hover:border-neutral-300'
                } border-neutral-200`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${isAllowed ? 'bg-amber-50 text-amber-800' : 'bg-neutral-100 text-neutral-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h6 className="font-semibold text-sm text-ink-900 flex items-center gap-2">
                      {b.name}
                      {!isAllowed && (
                        <span className="text-[10px] bg-neutral-100 text-neutral-600 font-bold px-2 py-0.5 rounded">
                          {!benefits.enabled ? 'GLOBAL OFF' : 'BLOCKED'}
                        </span>
                      )}
                    </h6>
                    <p className="text-xs text-neutral-500 mt-0.5">{b.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${isAllowed ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    {isAllowed ? 'PERMITTED' : 'BLOCKED'}
                  </span>
                  <Switch
                    checked={isMethodChecked}
                    disabled={isUpdating}
                    onCheckedChange={(val) => handleMethodToggle(b.key, val)}
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
