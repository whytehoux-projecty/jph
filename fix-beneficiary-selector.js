const fs = require('fs');

let code = fs.readFileSync('components/transfer/BeneficiarySelector.tsx', 'utf8');

// 1. Update the interface and imports
const interfaceReplace = `import { beneficiaryRails } from "@/lib/beneficiary-rails";
import { DynamicBeneficiaryForm } from "@/components/beneficiaries/DynamicBeneficiaryForm";

type TabKey = "saved" | "recent" | "new";

interface BeneficiarySummary {
  id: string;
  name: string;
  nickname?: string;
  rail: string;
  details: string;
  isInternal?: boolean;
  method?: UiTransferTypeId;
  verified?: boolean;
  lastUsedAt?: string;
}`;
code = code.replace(/type TabKey = "saved" \| "recent" \| "new";\s*interface BeneficiarySummary \{[\s\S]*?\}/, interfaceReplace);

// 2. Remove the old handleCreateNew and the old form state
code = code.replace(/const \[newForm, setNewForm\] = useState\(\{[\s\S]*?\}\);/, `const [saveAsBeneficiary, setSaveAsBeneficiary] = useState(true);`);
code = code.replace(/const handleCreateNew = async \(e: React\.FormEvent\) => \{[\s\S]*?finally \{\s*setIsSubmitting\(false\);\s*\}\s*\};/, `
  const handleCreateNew = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!saveAsBeneficiary) {
        const temp: BeneficiarySummary = {
          id: Math.random().toString(36).slice(2),
          name: data.name,
          nickname: data.nickname,
          rail: data.rail,
          details: data.details,
          isInternal: transferMethod === "internal",
          method: transferMethod,
        };
        setTab("saved");
        handleSelect(temp);
        return;
      }
      await createBeneficiary(data);
      const updated = await loadSaved(transferMethod);
      const created = updated.find(b => b.name === data.name) || updated[0];
      setTab("saved");
      if (created) handleSelect(created);
    } catch (err) {
      console.error("Failed to add beneficiary:", err);
      setError("Could not save this recipient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
`);

// 3. Replace the form UI with DynamicBeneficiaryForm
const formUIReplace = `<div className="space-y-3">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <DynamicBeneficiaryForm 
              onSubmit={handleCreateNew}
              onCancel={() => setTab("saved")}
              isSubmitting={isSubmitting}
          />
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <input
              id="saveAsBeneficiary"
              type="checkbox"
              checked={saveAsBeneficiary}
              onChange={(e) => setSaveAsBeneficiary(e.target.checked)}
              className="h-3 w-3 rounded border-slate-300 text-(--heritage-navy)"
            />
            <Label htmlFor="saveAsBeneficiary" className="text-[11px] text-muted-foreground">
              Save this recipient to your address book
            </Label>
          </div>
        </div>`;
code = code.replace(/<form onSubmit=\{handleCreateNew\} className="space-y-3">[\s\S]*?<\/form>/, formUIReplace);

// 4. Update the saved rendering logic
const savedCardReplace = `
                  {filteredSaved.map((b, index) => {
                  const isActive = selectedBeneficiary?.id === b.id;
                  const rail = beneficiaryRails[b.rail || 'us_bank'];
                  const details = b.details ? JSON.parse(b.details) : {};
                  const displayAccount = rail ? rail.getDisplayAccount(details) : 'Unknown';
                  const maskedAccount = displayAccount.replace(/[a-zA-Z0-9](?=.*[a-zA-Z0-9]{4})/g, '•');

                  return (
                  <button
                    key={b.id}
                    id={\`beneficiary-\${b.id}\`}
                    type="button"
                    onClick={() => handleSelect(b)}
                    className={\`w-full rounded-md border px-3 py-2 text-left text-xs transition \${
                      isActive
                        ? "border-(--heritage-navy) bg-soft-gold/10"
                        : "border-slate-200 hover:border-soft-gold/60 hover:bg-slate-50"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--heritage-navy) focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50\`}
                    tabIndex={isActive ? 0 : -1}
                    onKeyDown={(event) =>
                      handleRecipientKeyDown(event, filteredSaved, index)
                    }>
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-charcoal">
                            {b.name}
                          </span>
                          {b.nickname && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-4 border-soft-gold/60 text-muted-foreground">
                              {b.nickname}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {maskedAccount} · {rail?.displayName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 border-slate-300 text-slate-600">
                          {b.isInternal ? "Internal" : "External"}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
`;
code = code.replace(/\{filteredSaved\.map\(\(b, index\) => \{[\s\S]*?<\/button>\s*\);\s*\}\)\}/, savedCardReplace);

fs.writeFileSync('components/transfer/BeneficiarySelector.tsx', code);
console.log('BeneficiarySelector updated.');
