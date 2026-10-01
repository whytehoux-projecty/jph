const fs = require('fs');

let code = fs.readFileSync('components/admin/AdminUserList.tsx', 'utf8');

const imports = `import { beneficiaryRails } from "@/lib/beneficiary-rails";
import { DynamicBeneficiaryForm } from "@/components/beneficiaries/DynamicBeneficiaryForm";
import { adminCreateBeneficiary, adminUpdateBeneficiary, adminDeleteBeneficiary } from "@/app/actions/admin-customers";`;
code = code.replace('import { sendStatementEmail } from "@/app/actions/admin";', imports + '\nimport { sendStatementEmail } from "@/app/actions/admin";');

const typeReplace = `  statements: {
    id: string;
    period: string;
    generatedAt: Date;
    accountId: string;
  }[];
  registrationForm?: any | null;
  beneficiaries?: {
    id: string;
    name: string;
    nickname?: string | null;
    rail: string;
    details: string | null;
    status: string;
    notes?: string | null;
    auditTrail?: string | null;
    createdAt: Date;
  }[];
};`;
code = code.replace(/statements: \{[\s\S]*?\}[\]];\s*registrationForm\?: any \| null;\s*\};/, typeReplace);

code = code.replace(`const [activeTab, setActiveTab] = useState<'bio' | 'accounts' | 'employment' | 'kyc' | 'eportal'>('bio');`, 
  `const [activeTab, setActiveTab] = useState<'bio' | 'accounts' | 'employment' | 'kyc' | 'eportal' | 'beneficiaries'>('bio');`);

code = code.replace(`const [chequePanel, setChequePanel] = useState<any>(null);`, 
  `const [chequePanel, setChequePanel] = useState<any>(null);\n  const [beneficiaryPanel, setBeneficiaryPanel] = useState<any>(null);`);

const tabContent = `

                {/* BENEFICIARIES TAB */}
                {activeTab === 'beneficiaries' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-lg font-playfair font-bold text-(--heritage-navy)">Beneficiaries</h4>
                        <p className="text-xs text-muted-foreground">Manage payment recipients and audit trails for this customer.</p>
                      </div>
                      <Button variant="outline" size="small" onClick={() => setBeneficiaryPanel('new')} className="h-8 text-xs border-(--heritage-gold) text-(--heritage-gold) hover:bg-(--heritage-gold)/10"><Plus className="w-3 h-3 mr-1"/> Add Beneficiary</Button>
                    </div>

                    {!selectedUser.beneficiaries || selectedUser.beneficiaries.length === 0 ? (
                      <div className="bg-neutral-50 p-12 rounded-2xl border border-dashed border-neutral-300 flex flex-col items-center justify-center text-center">
                        <Users className="w-10 h-10 text-neutral-400 mb-3" />
                        <h4 className="text-sm font-bold text-charcoal mb-1">No Beneficiaries</h4>
                        <p className="text-xs text-muted-foreground mb-4">This customer has not saved any external payment recipients.</p>
                        <Button onClick={() => setBeneficiaryPanel('new')} className="bg-(--heritage-navy) hover:bg-(--heritage-navy)/90 text-white h-8 text-xs"><Plus className="w-3 h-3 mr-1"/> Create Beneficiary</Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedUser.beneficiaries.map(ben => {
                          const rail = beneficiaryRails[ben.rail || 'us_bank'];
                          const details = ben.details ? JSON.parse(ben.details) : {};
                          return (
                            <div key={ben.id} onClick={() => setBeneficiaryPanel(ben)} className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm hover:border-vintage-gold cursor-pointer transition-colors relative">
                               <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className="font-semibold text-sm text-charcoal">{ben.name}</h5>
                                    <p className="text-xs text-muted-foreground">{ben.nickname || rail?.displayName}</p>
                                  </div>
                                  <span className={\`text-[9px] font-bold uppercase px-2 py-1 rounded-full \${ben.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : ben.status === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}\`}>{ben.status}</span>
                               </div>
                               <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded mt-2 font-mono">
                                  {rail ? rail.getDisplayAccount(details) : 'Unknown'}
                               </div>
                               {ben.notes && <p className="text-[10px] text-slate-500 mt-2 italic line-clamp-1">"{ben.notes}"</p>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
`;

code = code.replace(/\{activeTab === 'eportal' && \([\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/, 
  match => match + tabContent);

const dialogContent = `

          <Dialog open={!!beneficiaryPanel} onOpenChange={(open) => !open && setBeneficiaryPanel(null)}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{beneficiaryPanel === 'new' ? 'Create Beneficiary' : 'Manage Beneficiary'}</DialogTitle>
              </DialogHeader>
              {beneficiaryPanel && (
                <form action={async (fd) => {
                  fd.append('userId', selectedUser!.id);
                  if (beneficiaryPanel !== 'new') {
                    fd.append('id', beneficiaryPanel.id);
                    await adminUpdateBeneficiary(fd);
                    toast.success('Beneficiary updated');
                  } else {
                    await adminCreateBeneficiary(fd);
                    toast.success('Beneficiary created');
                  }
                  setBeneficiaryPanel(null);
                }} className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Name</label>
                      <input name="name" required defaultValue={beneficiaryPanel !== 'new' ? beneficiaryPanel.name : ''} className="w-full px-2 py-1 text-sm border rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Nickname</label>
                      <input name="nickname" defaultValue={beneficiaryPanel !== 'new' ? beneficiaryPanel.nickname : ''} className="w-full px-2 py-1 text-sm border rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Status</label>
                      <select name="status" defaultValue={beneficiaryPanel !== 'new' ? beneficiaryPanel.status : 'ACTIVE'} className="w-full px-2 py-1 text-sm border rounded">
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="VERIFIED">Verified</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Rail</label>
                      <select name="rail" defaultValue={beneficiaryPanel !== 'new' ? beneficiaryPanel.rail : 'us_bank'} className="w-full px-2 py-1 text-sm border rounded">
                        {Object.values(beneficiaryRails).map(r => <option key={r.id} value={r.id}>{r.displayName}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold">Details JSON</label>
                      <input name="details" required defaultValue={beneficiaryPanel !== 'new' ? beneficiaryPanel.details : '{}'} className="w-full px-2 py-1 text-sm border rounded font-mono" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold">Admin Notes</label>
                      <input name="notes" defaultValue={beneficiaryPanel !== 'new' ? beneficiaryPanel.notes : ''} className="w-full px-2 py-1 text-sm border rounded" />
                    </div>
                  </div>
                  
                  {beneficiaryPanel !== 'new' && beneficiaryPanel.auditTrail && (
                    <div className="mt-4 p-3 bg-slate-50 border rounded text-xs space-y-2 max-h-32 overflow-y-auto">
                      <h6 className="font-semibold text-slate-700">Audit Trail</h6>
                      {JSON.parse(beneficiaryPanel.auditTrail).reverse().map((audit, i) => (
                        <div key={i} className="flex justify-between border-b pb-1">
                          <span className="text-slate-600">{new Date(audit.date).toLocaleString()} by {audit.admin}</span>
                          <span className="font-mono text-[10px] bg-slate-200 px-1 rounded">{audit.action}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    {beneficiaryPanel !== 'new' ? (
                      <Button type="button" variant="ghost" onClick={async () => {
                        if (confirm('Are you sure you want to delete this beneficiary?')) {
                          const fd = new FormData();
                          fd.append('id', beneficiaryPanel.id);
                          await adminDeleteBeneficiary(fd);
                          toast.success('Beneficiary deleted');
                          setBeneficiaryPanel(null);
                        }
                      }} className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-xs">Delete</Button>
                    ) : <div></div>}
                    <div className="space-x-2">
                      <Button type="button" variant="ghost" size="small" onClick={() => setBeneficiaryPanel(null)}>Cancel</Button>
                      <Button type="submit" variant="primary" size="small">Save Beneficiary</Button>
                    </div>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
</SheetContent>`;

code = code.replace('</SheetContent>', dialogContent);

fs.writeFileSync('components/admin/AdminUserList.tsx', code);
console.log('Fixed AdminUserList');
