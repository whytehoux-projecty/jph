'use client';

import { useState } from 'react';
import { TransferMethodConfig } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { updateTransferMethodConfig } from '@/app/actions/transferMethods';
import { Pencil, Check, X, ShieldAlert } from 'lucide-react';

interface TransferMethodsManagerProps {
  initialMethods: TransferMethodConfig[];
}

export function TransferMethodsManager({ initialMethods }: TransferMethodsManagerProps) {
  const [methods, setMethods] = useState<TransferMethodConfig[]>(initialMethods);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit State
  const [editForm, setEditForm] = useState<Partial<TransferMethodConfig>>({});

  const startEdit = (method: TransferMethodConfig) => {
    setEditingId(method.id);
    setEditForm(method);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    try {
      const updated = await updateTransferMethodConfig(id, editForm);
      setMethods(methods.map(m => m.id === id ? updated : m));
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert('Failed to save settings');
    }
  };

  const handleToggle = async (method: TransferMethodConfig, field: 'isEnabled' | 'isVisibleToUser') => {
    try {
      const updatedValue = !method[field];
      const updated = await updateTransferMethodConfig(method.id, { [field]: updatedValue });
      setMethods(methods.map(m => m.id === method.id ? updated : m));
    } catch (e) {
      console.error(e);
      alert('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 mt-0.5 text-blue-600 shrink-0" />
        <div className="text-sm leading-relaxed">
          <strong>Global Settings:</strong> Modifying these methods affects all customers universally. To disable a method for a specific individual, visit their Customer Profile page and use the specific overrides panel.
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {methods.map((method) => {
          const isEditing = editingId === method.id;

          return (
            <Card key={method.id} className={!method.isEnabled ? 'opacity-75' : ''}>
              <CardHeader className="pb-3 border-b border-neutral-100 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    {method.displayName}
                    {!method.isEnabled && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">DISABLED</span>}
                    {!method.isVisibleToUser && method.isEnabled && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">HIDDEN</span>}
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500 font-mono mt-1">ID: {method.methodId}</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="ghost" size="small" onClick={() => startEdit(method)}>
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="small" onClick={cancelEdit} className="text-neutral-500">
                      <X className="w-4 h-4" />
                    </Button>
                    <Button variant="primary" size="small" onClick={() => handleSave(method.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Display Name</Label>
                        <Input 
                          value={editForm.displayName || ''} 
                          onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Processing Time</Label>
                        <Input 
                          value={editForm.processingTime || ''} 
                          onChange={(e) => setEditForm({ ...editForm, processingTime: e.target.value })} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Base Fee ($)</Label>
                        <Input 
                          type="number"
                          value={editForm.baseFee ?? ''} 
                          onChange={(e) => setEditForm({ ...editForm, baseFee: parseFloat(e.target.value) || 0 })} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Percentage Fee (%)</Label>
                        <Input 
                          type="number"
                          step="0.1"
                          value={editForm.percentageFee ?? ''} 
                          onChange={(e) => setEditForm({ ...editForm, percentageFee: parseFloat(e.target.value) || 0 })} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Per Transfer Limit ($)</Label>
                        <Input 
                          type="number"
                          value={editForm.perTransferLimit ?? ''} 
                          onChange={(e) => setEditForm({ ...editForm, perTransferLimit: parseFloat(e.target.value) || 0 })} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Daily Limit ($)</Label>
                        <Input 
                          type="number"
                          value={editForm.dailyLimit ?? ''} 
                          onChange={(e) => setEditForm({ ...editForm, dailyLimit: parseFloat(e.target.value) || 0 })} 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div>
                        <span className="text-neutral-500 block text-xs uppercase tracking-wider mb-0.5">Limits</span>
                        <div className="font-medium">${method.perTransferLimit.toLocaleString()} / txn</div>
                        <div className="font-medium text-xs text-neutral-500">${method.dailyLimit.toLocaleString()} / day</div>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-xs uppercase tracking-wider mb-0.5">Fees & Time</span>
                        <div className="font-medium">{method.feeLabel}</div>
                        <div className="font-medium text-xs text-neutral-500">{method.processingTime}</div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-neutral-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Enabled Global System-wide</Label>
                          <p className="text-xs text-neutral-500">If disabled, this method cannot be used by anyone.</p>
                        </div>
                        <Switch 
                          checked={method.isEnabled}
                          onCheckedChange={() => handleToggle(method, 'isEnabled')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Visible to Users</Label>
                          <p className="text-xs text-neutral-500">If disabled, only admins can process this method.</p>
                        </div>
                        <Switch 
                          checked={method.isVisibleToUser}
                          onCheckedChange={() => handleToggle(method, 'isVisibleToUser')}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
