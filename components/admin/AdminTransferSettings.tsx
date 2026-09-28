"use client";

import { useState } from "react";
import { Settings2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

type TransferMethodConfig = {
  id: string;
  methodId: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  isVisibleToUser: boolean;
  badge: string | null;
  processingTime: string;
  feeLabel: string;
  baseFee: number;
  percentageFee: number;
  dailyLimit: number;
  perTransferLimit: number;
  formConfig: string;
  sortOrder: number;
};

export function AdminTransferSettings({ 
  configs,
  onSave
}: { 
  configs: TransferMethodConfig[];
  onSave: (formData: FormData) => void;
}) {
  const [selectedConfig, setSelectedConfig] = useState<TransferMethodConfig>(configs[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Selector */}
      <div className="w-full md:w-64 shrink-0 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center gap-2 text-charcoal font-semibold">
          <Settings2 className="w-4 h-4" /> Methods
        </div>
        <div className="flex flex-col">
          {configs.map((config) => (
            <button
              key={config.id}
              onClick={() => setSelectedConfig(config)}
              className={`text-left px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                selectedConfig.id === config.id 
                  ? "border-vintage-gold bg-vintage-gold/5 text-vintage-gold" 
                  : "border-transparent text-charcoal hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{config.displayName}</span>
                {!config.isEnabled && (
                  <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Off</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Form */}
      <div className="flex-1 bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-playfair font-bold text-charcoal mb-6 border-b border-neutral-100 pb-4">
          Edit {selectedConfig.displayName} Configuration
        </h2>

        <form action={handleSave} className="space-y-6">
          <input type="hidden" name="id" value={selectedConfig.id} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Display Name</label>
              <input 
                type="text" 
                name="displayName"
                defaultValue={selectedConfig.displayName}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Processing Time</label>
              <input 
                type="text" 
                name="processingTime"
                defaultValue={selectedConfig.processingTime}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-1">Description</label>
              <input 
                type="text" 
                name="description"
                defaultValue={selectedConfig.description}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Fee Label (Text)</label>
              <input 
                type="text" 
                name="feeLabel"
                defaultValue={selectedConfig.feeLabel}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Base Fee (Numeric $)</label>
              <input 
                type="number" 
                step="0.01"
                name="baseFee"
                defaultValue={selectedConfig.baseFee}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Daily Limit ($)</label>
              <input 
                type="number" 
                step="1"
                name="dailyLimit"
                defaultValue={selectedConfig.dailyLimit}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-charcoal">Status & Visibility</h3>
            
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                name="isEnabled" 
                value="true"
                defaultChecked={selectedConfig.isEnabled}
                className="w-4 h-4 text-vintage-gold border-neutral-300 rounded"
              />
              <span className="text-sm text-charcoal">System Enabled (Allow processing)</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                name="isVisibleToUser" 
                value="true"
                defaultChecked={selectedConfig.isVisibleToUser}
                className="w-4 h-4 text-vintage-gold border-neutral-300 rounded"
              />
              <span className="text-sm text-charcoal">Visible to Users in Portal</span>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving} className="bg-charcoal text-white hover:bg-charcoal/90 min-w-[120px]">
              {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
