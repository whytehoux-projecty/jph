"use client";

import * as React from "react";
import { BookUser, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userFacingError } from "@/lib/errors";
import {
  getRailForMethod,
  matchesTransferMethod,
  type BeneficiaryRail,
  type BeneficiaryField,
} from "@/lib/beneficiary-rails";
import { getBeneficiaries, createBeneficiary } from "@/app/actions/beneficiaries";
import { lookupInternalAccount } from "@/app/actions/transfer";
import { BrandIcon, getBrandIconSrc } from "@/components/ui/BrandIcon";

export interface SelectedBeneficiaryData {
  id?: string;
  name: string;
  nickname?: string;
  rail: string;
  details: Record<string, string>;
  isSaved?: boolean;
}

interface BeneficiaryPopoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  methodId: string;
  methodLabel?: string;
  initialMode?: "select" | "add";
  onSelectBeneficiary: (beneficiary: SelectedBeneficiaryData) => void;
}

export function BeneficiaryPopoutPanel({
  isOpen,
  onClose,
  methodId,
  methodLabel = "Transfer",
  initialMode = "select",
  onSelectBeneficiary,
}: BeneficiaryPopoutPanelProps) {
  const [mode, setMode] = React.useState<"select" | "add">(initialMode);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [savedList, setSavedList] = React.useState<any[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = React.useState(false);
  const [saveToContacts, setSaveToContacts] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Dynamic Add Form State
  const [formData, setFormData] = React.useState<{
    name: string;
    nickname: string;
    details: Record<string, string>;
  }>({
    name: "",
    nickname: "",
    details: {},
  });

  // Account lookup state for internal transfers
  const [lookupState, setLookupState] = React.useState<{
    status: "idle" | "loading" | "found" | "notfound";
    maskedName?: string;
  }>({ status: "idle" });

  const activeRail: BeneficiaryRail = React.useMemo(() => {
    return getRailForMethod(methodId);
  }, [methodId]);

  // Load saved beneficiaries
  const loadSaved = React.useCallback(async () => {
    setIsLoadingSaved(true);
    try {
      const res = await getBeneficiaries();
      setSavedList(Array.isArray(res) ? res : []);
    } catch {
      setSavedList([]);
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormErrors({});
      setFormData({ name: "", nickname: "", details: {} });
      loadSaved();
    }
  }, [isOpen, initialMode, loadSaved]);

  // Filtered saved beneficiaries matching the active method
  const matchingBeneficiaries = React.useMemo(() => {
    return savedList.filter((b) => {
      const matches = matchesTransferMethod(b.rail, methodId, b.isInternal);
      if (!matches) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      const nameMatch = b.name?.toLowerCase().includes(q) || b.nickname?.toLowerCase().includes(q);
      const accMatch = b.accountNumber?.toLowerCase().includes(q);
      const bankMatch = b.bankName?.toLowerCase().includes(q);

      let detailsText = "";
      try {
        const parsed = JSON.parse(b.details || "{}");
        detailsText = Object.values(parsed).join(" ").toLowerCase();
      } catch {}

      return nameMatch || accMatch || bankMatch || detailsText.includes(q);
    });
  }, [savedList, methodId, searchTerm]);

  // Internal account lookup effect
  const internalAccNumber = formData.details.accountNumber || "";
  React.useEffect(() => {
    if (methodId !== "internal" && methodId !== "other") return;
    if (!/^\d{6,17}$/.test(internalAccNumber)) {
      setLookupState({ status: "idle" });
      return;
    }
    setLookupState({ status: "loading" });
    const timer = setTimeout(async () => {
      try {
        const res = await lookupInternalAccount(internalAccNumber);
        if (res.found) {
          setLookupState({ status: "found", maskedName: res.maskedName });
          if (!formData.name) {
            setFormData((prev) => ({ ...prev, name: res.maskedName || "" }));
          }
        } else {
          setLookupState({ status: "notfound" });
        }
      } catch {
        setLookupState({ status: "notfound" });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [internalAccNumber, methodId, formData.name]);

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      details: { ...prev.details, [key]: value },
    }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSelectExisting = (item: any) => {
    let detailsObj: Record<string, string> = {};
    try {
      detailsObj = JSON.parse(item.details || "{}");
    } catch {}

    // Merge top-level DB fields if missing
    if (item.accountNumber && !detailsObj.accountNumber) detailsObj.accountNumber = item.accountNumber;
    if (item.bankName && !detailsObj.bankName) detailsObj.bankName = item.bankName;
    if (item.swiftCode && !detailsObj.swiftBic) detailsObj.swiftBic = item.swiftCode;

    onSelectBeneficiary({
      id: item.id,
      name: item.name,
      nickname: item.nickname,
      rail: item.rail,
      details: detailsObj,
      isSaved: true,
    });
    onClose();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Enter the payee's full name.";
    }

    // Validate fields according to active rail
    activeRail.fields.forEach((f) => {
      const val = formData.details[f.name] || "";
      if (f.required && !val.trim()) {
        errors[f.name] = `Enter ${f.label.charAt(0).toLowerCase()}${f.label.slice(1)}.`;
      } else if (val) {
        try {
          f.validation.parse(val);
        } catch (err: any) {
          errors[f.name] = err?.issues?.[0]?.message || `Check ${f.label.charAt(0).toLowerCase()}${f.label.slice(1)}.`;
        }
      }
    });

    // Check confirm fields
    if (
      formData.details.accountNumber &&
      formData.details.accountNumberConfirm &&
      formData.details.accountNumber !== formData.details.accountNumberConfirm
    ) {
      errors.accountNumberConfirm = "The account numbers don't match.";
    }
    if (
      formData.details.iban &&
      formData.details.ibanConfirm &&
      formData.details.iban !== formData.details.ibanConfirm
    ) {
      errors.ibanConfirm = "The IBANs don't match.";
    }
    if (
      formData.details.address &&
      formData.details.addressConfirm &&
      formData.details.address !== formData.details.addressConfirm
    ) {
      errors.addressConfirm = "The wallet addresses don't match.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      let savedId: string | undefined = undefined;
      if (saveToContacts) {
        const created = await createBeneficiary({
          name: formData.name.trim(),
          nickname: formData.nickname.trim() || undefined,
          rail: activeRail.id,
          details: JSON.stringify(formData.details),
          isInternal: methodId === "internal" || methodId === "other",
          accountNumber:
            formData.details.accountNumber ||
            formData.details.iban ||
            formData.details.address ||
            formData.details.cashtag ||
            formData.details.username ||
            undefined,
          bankName: formData.details.bankName || undefined,
          swiftCode: formData.details.swiftBic || undefined,
        });
        savedId = created?.id;
      }

      onSelectBeneficiary({
        id: savedId,
        name: formData.name.trim(),
        nickname: formData.nickname.trim() || undefined,
        rail: activeRail.id,
        details: formData.details,
        isSaved: saveToContacts,
      });
      onClose();
    } catch (err: any) {
      setFormErrors({ submit: userFacingError(err, "We couldn't save this payee. Please try again.") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && !isSubmitting && onClose()}>
      <SheetContent side="right" className="w-[min(100vw,32rem)] gap-0 p-0 sm:max-w-none">
        <SheetHeader className="border-b border-line p-6 pb-4">
          <p className="text-label uppercase text-fg-muted">{methodLabel}</p>
          <SheetTitle>{mode === "select" ? "Choose a payee" : "Pay someone new"}</SheetTitle>
          <SheetDescription className="sr-only">Saved payees and new payee details for {methodLabel}.</SheetDescription>
        </SheetHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "select" | "add")} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="px-6">
            <TabsTrigger value="select">Saved payees ({matchingBeneficiaries.length})</TabsTrigger>
            <TabsTrigger value="add">New payee</TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="mt-0 flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
                <Input
                  type="search"
                  aria-label="Search payees"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, bank or account"
                  className="pl-9"
                />
              </div>

              {isLoadingSaved ? (
                <div aria-busy="true" className="flex flex-col gap-3">
                  <p className="sr-only" role="status">Loading your payees</p>
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-surface" />
                  ))}
                </div>
              ) : matchingBeneficiaries.length === 0 ? (
                <EmptyState
                  compact
                  icon={BookUser}
                  title={searchTerm ? "No payees match your search" : "No saved payees yet"}
                  description={searchTerm ? "Try a different name, or add a new payee." : `You haven't saved anyone for ${methodLabel} yet.`}
                  action={
                    <Button variant="secondary" icon={<UserPlus aria-hidden="true" />} onClick={() => setMode("add")}>
                      Add a payee
                    </Button>
                  }
                />
              ) : (
                <ul className="flex flex-col gap-2">
                  {matchingBeneficiaries.map((b) => {
                    let parsed = {};
                    try {
                      parsed = JSON.parse(b.details || "{}");
                    } catch {}
                    const displayDetail = activeRail.getDisplayAccount(parsed);
                    return (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectExisting(b)}
                          className="flex w-full items-start gap-3 rounded-surface border border-line bg-surface p-4 text-left transition-colors hover:border-line-strong hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        >
                          {(getBrandIconSrc(b.rail) || getBrandIconSrc(methodId)) && (
                            <BrandIcon name={b.rail || methodId} size={24} alt="" className="mt-0.5" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-body font-semibold text-fg">
                              {b.name}
                              {b.nickname && <span className="ml-2 font-normal text-fg-muted">({b.nickname})</span>}
                            </span>
                            {displayDetail && <span className="mt-0.5 block break-all text-small text-fg-muted">{displayDetail}</span>}
                          </span>
                          <span className="self-center text-small font-semibold text-fg-action">Choose</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="add" className="mt-0 flex-1 overflow-y-auto p-6">
            <form onSubmit={handleCreateSubmit} noValidate className="flex flex-col gap-5">
              {formErrors.submit && <Alert variant="danger">{formErrors.submit}</Alert>}

              <FormField label="Full name" hint="As it appears on their account." error={formErrors.name || undefined} required>
                <Input
                  autoComplete="off"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, name: e.target.value }));
                    if (formErrors.name) setFormErrors((p) => ({ ...p, name: "" }));
                  }}
                />
              </FormField>
              <FormField label="Nickname" optional hint="For example, “Landlord”. Only you see this.">
                <Input autoComplete="off" value={formData.nickname} onChange={(e) => setFormData((p) => ({ ...p, nickname: e.target.value }))} />
              </FormField>

              <fieldset className="flex flex-col gap-5 border-t border-line pt-5">
                <legend className="mb-1 flex items-center gap-2 text-small font-semibold text-fg">
                  {getBrandIconSrc(activeRail.id) && <BrandIcon name={activeRail.id} size={20} alt="" />}
                  {activeRail.displayName} details
                </legend>
                {activeRail.fields.map((field) => {
                  const error = formErrors[field.name] || undefined;
                  const val = formData.details[field.name] || "";
                  return (
                    <FormField key={field.name} label={field.label} hint={field.helpText} error={error} required={field.required} optional={!field.required}>
                      {field.type === "select" ? (
                        <NativeSelect value={val} onChange={(e) => handleFieldChange(field.name, e.target.value)}>
                          <option value="">Choose one</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </NativeSelect>
                      ) : (
                        <Input
                          type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
                          autoComplete="off"
                          spellCheck={false}
                          value={val}
                          placeholder={field.placeholder}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        />
                      )}
                    </FormField>
                  );
                })}

                {(methodId === "internal" || methodId === "other") && (
                  <div aria-live="polite">
                    {lookupState.status === "loading" && <p className="text-small text-fg-muted">Checking the account holder…</p>}
                    {lookupState.status === "notfound" && (
                      <p className="text-small text-danger">We can't find an active Heritage Trust account with this number.</p>
                    )}
                    {lookupState.status === "found" && (
                      <Alert variant="success">
                        Account holder: <strong>{lookupState.maskedName}</strong>
                      </Alert>
                    )}
                  </div>
                )}
              </fieldset>

              <Checkbox
                checked={saveToContacts}
                onChange={(e) => setSaveToContacts(e.target.checked)}
                label="Save as a payee"
                description="So you can choose them quickly next time."
              />

              <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-between">
                <Button variant="tertiary" onClick={() => setMode("select")} disabled={isSubmitting}>
                  Back to saved payees
                </Button>
                <Button type="submit" loading={isSubmitting} loadingLabel="Saving payee">
                  {saveToContacts ? "Save and continue" : "Continue"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
