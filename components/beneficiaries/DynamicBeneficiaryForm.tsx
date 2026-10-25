'use client';

import { useState } from 'react';
import { beneficiaryRails } from '@/lib/beneficiary-rails';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { BrandIcon, getBrandIconSrc } from '@/components/ui/BrandIcon';

interface DynamicBeneficiaryFormProps {
  initialData?: any;
  onSubmit: (data: { name: string; nickname?: string; rail: string; details: string; status?: string; notes?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isAdmin?: boolean;
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Payee details for any payment method (shared by the portal and the admin). */
export function DynamicBeneficiaryForm({ initialData, onSubmit, onCancel, isSubmitting, isAdmin }: DynamicBeneficiaryFormProps) {
  const [railId, setRailId] = useState<string>(initialData?.rail || 'us_bank');
  const [name, setName] = useState(initialData?.name || '');
  const [nickname, setNickname] = useState(initialData?.nickname || '');
  const [status, setStatus] = useState(initialData?.status || 'ACTIVE');
  const [notes, setNotes] = useState(initialData?.notes || '');

  let defaultDetails = {};
  try {
    defaultDetails = initialData?.details ? JSON.parse(initialData.details) : {};
  } catch {
    defaultDetails = {};
  }
  const [details, setDetails] = useState<Record<string, string>>(defaultDetails);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeRail = beneficiaryRails[railId];

  const handleFieldChange = (fieldName: string, value: string) => {
    setDetails((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Enter the payee's full name.";

    activeRail?.fields.forEach((field) => {
      const val = details[field.name] || '';
      if (field.required && !val.trim()) {
        newErrors[field.name] = `Enter ${lower(field.label)}.`;
      } else if (val.trim()) {
        try {
          field.validation.parse(val);
        } catch (err: any) {
          newErrors[field.name] = err.issues?.[0]?.message || `Check ${lower(field.label)}.`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Move focus to the first field with an error.
      requestAnimationFrame(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus());
      return;
    }

    await onSubmit({
      name,
      nickname,
      rail: railId,
      details: JSON.stringify(details),
      ...(isAdmin ? { status, notes } : {}),
    });
  };

  return (
    <form onSubmit={validateAndSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full name" hint="As it appears on their account." error={errors.name} required>
          <Input
            autoComplete="off"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: '' }));
            }}
          />
        </FormField>
        <FormField label="Nickname" optional hint="Only you see this.">
          <Input autoComplete="off" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </FormField>
      </div>

      <FormField label="How you'll pay them" required>
        <NativeSelect
          value={railId}
          onChange={(e) => {
            setRailId(e.target.value);
            setDetails({});
            setErrors({});
          }}
        >
          {Object.values(beneficiaryRails).map((rail) => (
            <option key={rail.id} value={rail.id}>
              {rail.displayName}
            </option>
          ))}
        </NativeSelect>
      </FormField>

      {activeRail && activeRail.fields.length > 0 && (
        <fieldset className="flex flex-col gap-5 rounded-surface border border-line bg-surface-muted p-4">
          <legend className="flex items-center gap-2 px-1 text-small font-semibold text-fg">
            {getBrandIconSrc(railId) && <BrandIcon name={railId} size={18} alt="" />}
            {activeRail.displayName} details
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {activeRail.fields.map((field) => (
              <FormField
                key={field.name}
                label={field.label}
                hint={field.helpText}
                error={errors[field.name]}
                required={field.required}
                optional={!field.required}
              >
                {field.type === 'select' ? (
                  <NativeSelect value={details[field.name] || ''} onChange={(e) => handleFieldChange(field.name, e.target.value)}>
                    <option value="">Choose one</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </NativeSelect>
                ) : (
                  <Input
                    type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={field.placeholder}
                    value={details[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  />
                )}
              </FormField>
            ))}
          </div>
        </fieldset>
      )}

      {isAdmin && (
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Status">
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="BLOCKED">Blocked</option>
              <option value="VERIFIED">Verified</option>
            </NativeSelect>
          </FormField>
          <FormField label="Admin notes" optional>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
        </div>
      )}

      {isAdmin && initialData?.auditTrail && (
        <div className="max-h-32 overflow-y-auto rounded-surface border border-line bg-surface-muted p-3 text-caption">
          <h4 className="font-semibold text-fg">Audit trail</h4>
          {(() => {
            let audits: Array<{ date: string; admin: string; action: string }> = [];
            try {
              audits = JSON.parse(initialData.auditTrail);
            } catch {}
            return [...audits].reverse().map((audit, i) => (
              <div key={i} className="flex justify-between gap-3 border-b border-line py-1 last:border-0">
                <span className="text-fg-muted">
                  {new Date(audit.date).toLocaleString()} by {audit.admin}
                </span>
                <span className="font-code text-fg">{audit.action}</span>
              </div>
            ));
          })()}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        {isAdmin && initialData?.id && initialData?.id !== 'new' ? (
          <Button
            type="button"
            variant="tertiary"
            className="text-danger hover:bg-danger-subtle"
            onClick={async () => {
              if (confirm('Delete this beneficiary?')) await onSubmit({ ...initialData, isDelete: true });
            }}
          >
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="tertiary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingLabel="Saving payee">
            {initialData?.id ? 'Save changes' : 'Save payee'}
          </Button>
        </div>
      </div>
    </form>
  );
}
