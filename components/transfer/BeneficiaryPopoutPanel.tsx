"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Search,
  UserPlus,
  BookUser,
  Check,
  Building2,
  Globe2,
  Wallet,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
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
            setFormData((prev) => ({ ...prev, name: res.maskedName || "Internal Payee" }));
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
      errors.name = "Full Name / Recipient Name is required.";
    }

    // Validate fields according to active rail
    activeRail.fields.forEach((f) => {
      const val = formData.details[f.name] || "";
      if (f.required && !val.trim()) {
        errors[f.name] = `${f.label} is required.`;
      } else if (val) {
        try {
          f.validation.parse(val);
        } catch (err: any) {
          errors[f.name] = err?.issues?.[0]?.message || "Invalid input";
        }
      }
    });

    // Check confirm fields
    if (
      formData.details.accountNumber &&
      formData.details.accountNumberConfirm &&
      formData.details.accountNumber !== formData.details.accountNumberConfirm
    ) {
      errors.accountNumberConfirm = "Account numbers do not match.";
    }
    if (
      formData.details.iban &&
      formData.details.ibanConfirm &&
      formData.details.iban !== formData.details.ibanConfirm
    ) {
      errors.ibanConfirm = "IBAN numbers do not match.";
    }
    if (
      formData.details.address &&
      formData.details.addressConfirm &&
      formData.details.address !== formData.details.addressConfirm
    ) {
      errors.addressConfirm = "Addresses do not match.";
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
      setFormErrors({ submit: err?.message || "Failed to process beneficiary. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            key="beneficiary-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Slide-over Pop-out Panel */}
          <motion.aside
            key="beneficiary-popout-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Beneficiary contacts for ${methodLabel}`}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-paper-300 bg-white font-sans shadow-2xl"
          >
            {/* Panel Header */}
            <header className="flex items-center justify-between border-b border-paper-300 bg-paper-50 px-6 py-4">
              <div className="flex items-center gap-3">
                {getBrandIconSrc(methodId) && (
                  <div className="h-9 w-9 border border-paper-300 bg-white flex items-center justify-center p-1 shrink-0 rounded-none">
                    <BrandIcon name={methodId} size={24} />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pine-700">
                    {methodLabel}
                  </span>
                  <h2 className="font-display text-lg font-bold text-ink-900">
                    {mode === "select" ? "Select Beneficiary" : "Add New Beneficiary"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-none border border-transparent p-1.5 text-ink-500 transition-colors hover:border-paper-300 hover:bg-white hover:text-ink-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink-900"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Mode Switcher Tabs with Squared-Edge Aesthetics */}
            <div className="flex border-b border-paper-300 bg-paper-100/50 p-2">
              <button
                type="button"
                onClick={() => setMode("select")}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded-none border text-center flex items-center justify-center gap-2",
                  mode === "select"
                    ? "bg-ink-900 text-white border-ink-900 shadow-xs"
                    : "bg-white text-ink-600 border-paper-300 hover:bg-paper-100 hover:text-ink-900"
                )}
              >
                <BookUser className="h-3.5 w-3.5" />
                Saved Contacts ({matchingBeneficiaries.length})
              </button>
              <button
                type="button"
                onClick={() => setMode("add")}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded-none border border-l-0 text-center flex items-center justify-center gap-2",
                  mode === "add"
                    ? "bg-ink-900 text-white border-ink-900 shadow-xs"
                    : "bg-white text-ink-600 border-paper-300 hover:bg-paper-100 hover:text-ink-900"
                )}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add New
              </button>
            </div>

            {/* Panel Body Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {mode === "select" ? (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, bank, or account..."
                      className="w-full h-11 rounded-none border border-paper-300 bg-paper-50 pl-9 pr-3 text-small text-ink-900 outline-none transition-shadow focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 placeholder:text-ink-400"
                    />
                  </div>

                  {isLoadingSaved ? (
                    <div className="flex flex-col items-center justify-center py-12 text-ink-500">
                      <Loader2 className="h-6 w-6 animate-spin text-ink-900" />
                      <p className="mt-2 text-xs">Loading saved contacts…</p>
                    </div>
                  ) : matchingBeneficiaries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border border-dashed border-paper-300 bg-paper-50/50 p-8 text-center rounded-none">
                      <BookUser className="h-8 w-8 text-ink-400" />
                      <h3 className="mt-3 font-display text-sm font-semibold text-ink-900">
                        {searchTerm ? "No contacts match your search" : "No saved recipients yet"}
                      </h3>
                      <p className="mt-1 text-xs text-ink-500 max-w-xs">
                        {searchTerm
                          ? "Try a different keyword or create a new contact."
                          : `You haven't saved any beneficiaries for ${methodLabel} yet.`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setMode("add")}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-none bg-ink-900 px-4 py-2 text-xs font-semibold text-white hover:bg-ink-800 transition-colors"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Add New Beneficiary
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {matchingBeneficiaries.map((b) => {
                        let parsed = {};
                        try {
                          parsed = JSON.parse(b.details || "{}");
                        } catch {}
                        const displayDetail = activeRail.getDisplayAccount(parsed);

                        return (
                          <div
                            key={b.id}
                            className="group flex flex-col justify-between border border-paper-300 bg-white p-4 transition-all hover:border-ink-900 hover:shadow-sm rounded-none"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                {(getBrandIconSrc(b.rail) || getBrandIconSrc(methodId)) && (
                                  <div className="h-9 w-9 border border-paper-300 bg-paper-50 flex items-center justify-center p-1 shrink-0 rounded-none mt-0.5">
                                    <BrandIcon name={b.rail || methodId} size={24} />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-display text-sm font-bold text-ink-900 truncate">
                                      {b.name}
                                    </h4>
                                    {b.nickname && (
                                      <span className="rounded-none border border-paper-300 bg-paper-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-600">
                                        {b.nickname}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 font-mono text-xs text-ink-600 break-all">
                                    {displayDetail}
                                  </p>
                                </div>
                              </div>
                              <span className="shrink-0 rounded-none bg-pine-700/10 px-2 py-0.5 text-[10px] font-semibold text-pine-700">
                                {b.status || "SAVED"}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-end border-t border-paper-200 pt-3">
                              <button
                                type="button"
                                onClick={() => handleSelectExisting(b)}
                                className="inline-flex items-center gap-1.5 rounded-none bg-ink-900 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-ink-800"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Select Recipient
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Mode: Add New Beneficiary Form */
                <form onSubmit={handleCreateSubmit} className="space-y-5">
                  {formErrors.submit && (
                    <div className="flex items-start gap-2 border border-vermilion-600 bg-vermilion-50 p-3 text-xs text-vermilion-700 rounded-none">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{formErrors.submit}</span>
                    </div>
                  )}

                  {/* Universal Recipient Name & Nickname */}
                  <div className="space-y-4 border-b border-paper-200 pb-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900">
                        Beneficiary Full Name <span className="text-vermilion-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData((p) => ({ ...p, name: e.target.value }));
                          if (formErrors.name) setFormErrors((p) => ({ ...p, name: "" }));
                        }}
                        placeholder="e.g. John Doe, Acme Corp"
                        className={cn(
                          "w-full h-11 rounded-none border bg-paper-50 px-3 text-small text-ink-900 outline-none transition-shadow",
                          "focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900",
                          formErrors.name ? "border-vermilion-600" : "border-paper-300"
                        )}
                      />
                      {formErrors.name && (
                        <p className="text-xs text-vermilion-600">{formErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Nickname / Label <span className="font-normal text-ink-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.nickname}
                        onChange={(e) => setFormData((p) => ({ ...p, nickname: e.target.value }))}
                        placeholder="e.g. Landlord, Consulting, Family"
                        className="w-full h-11 rounded-none border border-paper-300 bg-paper-50 px-3 text-small text-ink-900 outline-none transition-shadow focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900"
                      />
                    </div>
                  </div>

                  {/* Tailored Rail-Specific Fields */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getBrandIconSrc(activeRail.id) && (
                        <BrandIcon name={activeRail.id} size={20} />
                      )}
                      <span className="block text-xs font-bold uppercase tracking-wider text-pine-700">
                        {activeRail.displayName} Details
                      </span>
                    </div>

                    {activeRail.fields.map((field) => {
                      const error = formErrors[field.name];
                      const val = formData.details[field.name] || "";

                      if (field.type === "select") {
                        return (
                          <div key={field.name} className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900">
                              {field.label}{" "}
                              {field.required && <span className="text-vermilion-600">*</span>}
                            </label>
                            <select
                              value={val}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              className={cn(
                                "w-full h-11 rounded-none border bg-paper-50 px-3 text-small text-ink-900 outline-none transition-shadow",
                                "focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900",
                                error ? "border-vermilion-600" : "border-paper-300"
                              )}
                            >
                              <option value="">Select option</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {field.helpText && !error && (
                              <p className="text-[11px] text-ink-500">{field.helpText}</p>
                            )}
                            {error && <p className="text-xs text-vermilion-600">{error}</p>}
                          </div>
                        );
                      }

                      return (
                        <div key={field.name} className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900">
                            {field.label}{" "}
                            {field.required && <span className="text-vermilion-600">*</span>}
                          </label>
                          <input
                            type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
                            value={val}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className={cn(
                              "w-full h-11 rounded-none border bg-paper-50 px-3 text-small text-ink-900 outline-none transition-shadow",
                              "focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900",
                              error ? "border-vermilion-600" : "border-paper-300"
                            )}
                          />
                          {field.helpText && !error && (
                            <p className="text-[11px] text-ink-500">{field.helpText}</p>
                          )}
                          {error && <p className="text-xs text-vermilion-600">{error}</p>}
                        </div>
                      );
                    })}

                    {/* Internal account lookup feedback if rail is internal */}
                    {(methodId === "internal" || methodId === "other") && (
                      <div className="text-xs">
                        {lookupState.status === "loading" && (
                          <p className="text-ink-500">Checking account holder…</p>
                        )}
                        {lookupState.status === "notfound" && (
                          <p className="text-vermilion-600 font-semibold">
                            No active account found with this number.
                          </p>
                        )}
                        {lookupState.status === "found" && (
                          <div className="flex items-center gap-2 border border-pine-700/40 bg-pine-50 p-2.5 text-pine-900">
                            <ShieldCheck className="h-4 w-4 text-pine-700" />
                            <span>
                              Verified account holder: <strong>{lookupState.maskedName}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Crucial: Save to Contacts Checkbox */}
                  <div className="border-t border-paper-200 pt-4">
                    <label className="flex cursor-pointer items-start gap-3 rounded-none border border-paper-300 bg-paper-50 p-3 text-small text-ink-800 transition-colors hover:border-ink-900">
                      <input
                        type="checkbox"
                        checked={saveToContacts}
                        onChange={(e) => setSaveToContacts(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded-none accent-pine-700"
                      />
                      <div>
                        <span className="font-semibold text-ink-900 block text-xs">
                          Save to contacts (Saved Beneficiary)
                        </span>
                        <span className="text-[11px] text-ink-500 block">
                          Remember this recipient for 1-click selection in future transfers.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Form Actions (Squared-Edge Aesthetics) */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-paper-200">
                    <button
                      type="button"
                      onClick={() => setMode("select")}
                      disabled={isSubmitting}
                      className="rounded-none border border-paper-300 bg-white px-5 py-2.5 text-xs font-semibold text-ink-700 hover:bg-paper-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-none bg-ink-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-ink-800 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving…
                        </>
                      ) : saveToContacts ? (
                        "Save & Use as Recipient"
                      ) : (
                        "Use as Recipient"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
