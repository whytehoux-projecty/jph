'use client';

import { useState } from 'react';
import { beneficiaryRails, BeneficiaryField } from '@/lib/beneficiary-rails';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';

interface DynamicBeneficiaryFormProps {
  initialData?: any;
  onSubmit: (data: { name: string; nickname?: string; rail: string; details: string; status?: string; notes?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isAdmin?: boolean;
}

export function DynamicBeneficiaryForm({ initialData, onSubmit, onCancel, isSubmitting, isAdmin }: DynamicBeneficiaryFormProps) {
  const [railId, setRailId] = useState<string>(initialData?.rail || 'us_bank');
  const [name, setName] = useState(initialData?.name || '');
  const [nickname, setNickname] = useState(initialData?.nickname || '');
  const [status, setStatus] = useState(initialData?.status || 'ACTIVE');
  const [notes, setNotes] = useState(initialData?.notes || '');
  
  let defaultDetails = {};
  try {
    defaultDetails = initialData?.details ? JSON.parse(initialData.details) : {};
  } catch (e) {
    defaultDetails = {};
  }
  const [details, setDetails] = useState<Record<string, string>>(defaultDetails);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeRail = beneficiaryRails[railId];

  const handleFieldChange = (fieldName: string, value: string) => {
    setDetails(prev => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (activeRail) {
      activeRail.fields.forEach(field => {
        const val = details[field.name] || "";
        if (field.required && !val.trim()) {
          newErrors[field.name] = `${field.label} is required.`;
        } else {
          try {
            field.validation.parse(val);
          } catch (err: any) {
            newErrors[field.name] = err.issues?.[0]?.message || "Invalid value";
          }
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      name,
      nickname,
      rail: railId,
      details: JSON.stringify(details),
      ...(isAdmin ? { status, notes } : {})
    });
  };

  return (
    <form onSubmit={validateAndSubmit} className="space-y-6">
      {/* Universal Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name <span className="text-red-500">*</span></Label>
          <Input 
            value={name} 
            onChange={e => {
              setName(e.target.value);
              setErrors(p => ({ ...p, name: '' }));
            }} 
            placeholder="e.g. Jane Doe"
            className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label>Nickname (Optional)</Label>
          <Input 
            value={nickname} 
            onChange={e => setNickname(e.target.value)} 
            placeholder="e.g. Rent, Freelancer" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Transfer Method (Rail) <span className="text-red-500">*</span></Label>
        <Select value={railId} onValueChange={(val) => {
          setRailId(val);
          setDetails({});
          setErrors({});
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(beneficiaryRails).map(rail => (
              <SelectItem key={rail.id} value={rail.id}>
                {rail.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-4 rounded-md space-y-4">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Transfer Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeRail?.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              {field.type === 'select' ? (
                <Select value={details[field.name] || ""} onValueChange={(val) => handleFieldChange(field.name, val)}>
                  <SelectTrigger className={errors[field.name] ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                    <SelectValue placeholder={field.placeholder || 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input 
                  type={field.type}
                  placeholder={field.placeholder}
                  value={details[field.name] || ""}
                  onChange={e => handleFieldChange(field.name, e.target.value)}
                  className={errors[field.name] ? 'border-red-500 focus-visible:ring-red-500 font-mono' : 'font-mono'}
                />
              )}
              {field.helpText && !errors[field.name] && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
              {errors[field.name] && (
                <p className="text-xs text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Input 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Internal notes..." 
            />
          </div>
        </div>
      )}

      {isAdmin && initialData?.auditTrail && (
        <div className="mt-4 p-3 bg-slate-50 border rounded text-xs space-y-2 max-h-32 overflow-y-auto">
          <h6 className="font-semibold text-slate-700">Audit Trail</h6>
          {(() => {
            let audits = [];
            try {
              audits = JSON.parse(initialData.auditTrail);
            } catch (e) {}
            return audits.reverse().map((audit: { date: string; admin: string; action: string }, i: number) => (
              <div key={i} className="flex justify-between border-b pb-1">
                <span className="text-slate-600">{new Date(audit.date).toLocaleString()} by {audit.admin}</span>
                <span className="font-mono text-[10px] bg-slate-200 px-1 rounded">{audit.action}</span>
              </div>
            ));
          })()}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-border">
        {isAdmin && initialData?.id && initialData?.id !== 'new' ? (
          <Button type="button" variant="ghost" onClick={async () => {
            if (confirm('Are you sure you want to delete this beneficiary?')) {
              await onSubmit({ ...initialData, isDelete: true });
            }
          }} className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-xs">Delete</Button>
        ) : <div></div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} variant="primary">
            {isSubmitting ? 'Saving...' : 'Save Beneficiary'}
          </Button>
        </div>
      </div>
    </form>
  );
}
