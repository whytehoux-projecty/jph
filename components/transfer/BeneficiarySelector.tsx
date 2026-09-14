import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { Search, UserPlus } from "lucide-react";
import { getBeneficiaries, getBeneficiariesByMethod, createBeneficiary } from "@/app/actions/beneficiaries";
import { getRecentRecipients } from "@/app/actions/transfer";import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { UiTransferTypeId } from "@/components/transfer/TransferMethodSelector";

type TabKey = "saved" | "recent" | "new";

interface BeneficiarySummary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  swiftCode?: string;
  nickname?: string;
  isInternal?: boolean;
  method?: UiTransferTypeId;
  verified?: boolean;
  lastUsedAt?: string;
}

interface BeneficiarySelectorProps {
  selectedBeneficiary?: BeneficiarySummary | null;
  onSelect: (beneficiary: BeneficiarySummary) => void;
  transferMethod?: UiTransferTypeId;
}

export function BeneficiarySelector({
  selectedBeneficiary,
  onSelect,
  transferMethod,
}: BeneficiarySelectorProps) {
  const [tab, setTab] = useState<TabKey>("saved");
  const [saved, setSaved] = useState<BeneficiarySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    accountNumber: "",
    bankName: "",
    swiftCode: "",
    nickname: "",
    contactType: "email" as "email" | "phone",
    contactValue: "",
    saveAsBeneficiary: true,
  });
  const [recent, setRecent] = useState<BeneficiarySummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const savedList = await loadSaved(transferMethod);
        await loadRecent(transferMethod, savedList);
      } catch (err) {
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [transferMethod]);

  const loadSaved = async (
    method?: UiTransferTypeId,
  ): Promise<BeneficiarySummary[]> => {
    try {
      const response = method
        ? await getBeneficiariesByMethod(method === 'internal' ? 'INTERNAL' : 'EXTERNAL')
        : await getBeneficiaries();
      const raw = (response as any).data ?? response;
      const list: BeneficiarySummary[] = Array.isArray(raw)
        ? raw
        : (raw?.beneficiaries ?? []);
      setSaved(list);
      return list;
    } catch (err) {
      const fallback: BeneficiarySummary[] = [
        {
          id: "1",
          name: "Alice Smith",
          accountNumber: "123456789",
          bankName: "Chase Bank",
          nickname: "Family",
          isInternal: false,
        },
        {
          id: "2",
          name: "Bob Jones",
          accountNumber: "987654321",
          bankName: "JP Heritage",
          nickname: "Investments",
          isInternal: true,
        },
      ];
      setSaved(fallback);
      setError("Unable to load saved recipients right now.");
      return fallback;
    }
  };

  const loadRecent = async (
    method?: UiTransferTypeId,
    savedList?: BeneficiarySummary[],
  ) => {
    try {
      if (!method) {
        setRecent(savedList ? savedList.slice(0, 3) : []);
        return;
      }
      const response = await getRecentRecipients(method, 5);
      const raw = (response as any).data ?? response;
      const list: BeneficiarySummary[] = Array.isArray(raw)
        ? raw
        : (raw?.recipients ?? raw?.items ?? []);
      setRecent(list);
    } catch (err) {
      setRecent(savedList ? savedList.slice(0, 3) : []);
    }
  };

  const filteredSaved = useMemo(() => {
    if (!searchTerm) return saved;
    const term = searchTerm.toLowerCase();
    return saved.filter((b) => {
      return (
        b.name.toLowerCase().includes(term) ||
        b.nickname?.toLowerCase().includes(term) ||
        b.bankName.toLowerCase().includes(term) ||
        b.accountNumber.includes(term)
      );
    });
  }, [saved, searchTerm]);

  const recentRecipients = useMemo(() => {
    if (recent.length) return recent;
    return saved.slice(0, 3);
  }, [recent, saved]);

  const handleSelect = (beneficiary: BeneficiarySummary) => {
    onSelect(beneficiary);
  };

  const handleRecipientKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    list: BeneficiarySummary[],
    index: number,
  ) => {
    const key = event.key;
    if (
      key !== "ArrowRight" &&
      key !== "ArrowLeft" &&
      key !== "ArrowDown" &&
      key !== "ArrowUp"
    ) {
      return;
    }
    event.preventDefault();
    if (!list.length) return;
    const direction = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
    let targetIndex = index;
    for (let i = 0; i < list.length; i += 1) {
      targetIndex = (targetIndex + direction + list.length) % list.length;
      const candidate = list[targetIndex];
      if (!candidate) continue;
      handleSelect(candidate);
      const element = document.getElementById(
        `beneficiary-${candidate.id}`,
      ) as HTMLButtonElement | null;
      if (element) {
        element.focus();
      }
      break;
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.accountNumber || !newForm.bankName) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (!newForm.saveAsBeneficiary) {
        const temp: BeneficiarySummary = {
          id: Math.random().toString(36).slice(2),
          name: newForm.name,
          accountNumber: newForm.accountNumber,
          bankName: newForm.bankName,
          swiftCode: newForm.swiftCode || undefined,
          nickname: newForm.nickname || undefined,
          isInternal: transferMethod === "internal",
          method: transferMethod,
        };
        setNewForm({
          name: "",
          accountNumber: "",
          bankName: "",
          swiftCode: "",
          nickname: "",
          contactType: "email",
          contactValue: "",
          saveAsBeneficiary: true,
        });
        setTab("saved");
        handleSelect(temp);
        return;
      }
      await createBeneficiary({
        name: newForm.name,
        accountNumber: newForm.accountNumber,
        bankName: newForm.bankName,
        swiftCode: newForm.swiftCode || undefined,
        isInternal: transferMethod === "internal",
      });
      const updated = await loadSaved(transferMethod);
      const created =
        updated.find(
          (b) =>
            b.accountNumber === newForm.accountNumber &&
            b.name === newForm.name &&
            b.bankName === newForm.bankName,
        ) ||
        ({
          id: Math.random().toString(36).slice(2),
          name: newForm.name,
          accountNumber: newForm.accountNumber,
          bankName: newForm.bankName,
          swiftCode: newForm.swiftCode || undefined,
          nickname: newForm.nickname || undefined,
          isInternal: transferMethod === "internal",
          method: transferMethod,
        } as BeneficiarySummary);
      setNewForm({
        name: "",
        accountNumber: "",
        bankName: "",
        swiftCode: "",
        nickname: "",
        contactType: "email",
        contactValue: "",
        saveAsBeneficiary: true,
      });
      setTab("saved");
      handleSelect(created);
    } catch (err) {
      console.error("Failed to add beneficiary:", err);
      setError("Could not save this recipient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabClasses = "bg-white text-charcoal shadow-sm";
  const inactiveTabClasses =
    "text-muted-foreground hover:text-charcoal hover:bg-white/60";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setTab("saved")}
            className={`px-3 py-1 rounded-full transition ${
              tab === "saved" ? activeTabClasses : inactiveTabClasses
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50`}>
            Saved
          </button>
          <button
            type="button"
            onClick={() => setTab("recent")}
            className={`px-3 py-1 rounded-full transition ${
              tab === "recent" ? activeTabClasses : inactiveTabClasses
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50`}>
            Recent
          </button>
          <button
            type="button"
            onClick={() => setTab("new")}
            className={`px-3 py-1 rounded-full transition ${
              tab === "new" ? activeTabClasses : inactiveTabClasses
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50`}>
            New
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : tab === "saved" ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search saved recipients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {error} You can still add a new recipient from the New tab below.
            </div>
          )}
          {filteredSaved.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No saved recipients match your search yet. Try a different search
              term or add a new recipient from the New tab.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {filteredSaved.map((b, index) => {
                const isActive = selectedBeneficiary?.id === b.id;
                return (
                  <button
                    key={b.id}
                    id={`beneficiary-${b.id}`}
                    type="button"
                    onClick={() => handleSelect(b)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-xs transition ${
                      isActive
                        ? "border-[color:var(--heritage-navy)] bg-soft-gold/10"
                        : "border-slate-200 hover:border-soft-gold/60 hover:bg-slate-50"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50`}
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
                          ••••{b.accountNumber.slice(-4)} · {b.bankName}
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
            </div>
          )}
        </div>
      ) : tab === "recent" ? (
        <div className="space-y-2">
          {recentRecipients.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Recent recipients will appear here after you send transfers.
            </p>
          ) : (
            <div className="space-y-2">
              {recentRecipients.map((b, index) => (
                <button
                  key={b.id}
                  id={`beneficiary-${b.id}`}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-xs hover:border-soft-gold/60 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                  tabIndex={
                    selectedBeneficiary && selectedBeneficiary.id === b.id
                      ? 0
                      : -1
                  }
                  onKeyDown={(event) =>
                    handleRecipientKeyDown(event, recentRecipients, index)
                  }>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-charcoal">{b.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        ••••{b.accountNumber.slice(-4)} · {b.bankName}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4 border-slate-300 text-slate-600">
                      Recent
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleCreateNew} className="space-y-3">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={newForm.name}
                onChange={(e) =>
                  setNewForm({ ...newForm, name: e.target.value })
                }
                placeholder="e.g. John Doe"
                className="h-9"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nickname (Optional)</Label>
              <Input
                value={newForm.nickname}
                onChange={(e) =>
                  setNewForm({ ...newForm, nickname: e.target.value })
                }
                placeholder="Family, Rent, Business"
                className="h-9"
              />
            </div>
          </div>
          {transferMethod === "zelle" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Contact Method</Label>
                <div className="inline-flex rounded-full bg-slate-100 p-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      setNewForm({ ...newForm, contactType: "email" })
                    }
                    className={`px-3 py-1 rounded-full transition ${
                      newForm.contactType === "email"
                        ? "bg-white text-charcoal shadow-sm"
                        : "text-muted-foreground hover:text-charcoal hover:bg-white/60"
                    }`}>
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewForm({ ...newForm, contactType: "phone" })
                    }
                    className={`px-3 py-1 rounded-full transition ${
                      newForm.contactType === "phone"
                        ? "bg-white text-charcoal shadow-sm"
                        : "text-muted-foreground hover:text-charcoal hover:bg-white/60"
                    }`}>
                    Mobile
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {newForm.contactType === "email"
                    ? "Email Address"
                    : "Mobile Number"}
                </Label>
                <Input
                  value={newForm.contactValue}
                  onChange={(e) =>
                    setNewForm({ ...newForm, contactValue: e.target.value })
                  }
                  placeholder={
                    newForm.contactType === "email"
                      ? "name@example.com"
                      : "e.g. +1 555 123 4567"
                  }
                  className="h-9"
                />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Account Number / IBAN</Label>
            <Input
              value={newForm.accountNumber}
              onChange={(e) =>
                setNewForm({ ...newForm, accountNumber: e.target.value })
              }
              placeholder="Enter account number"
              className="h-9 font-mono"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Bank Name</Label>
              <Input
                value={newForm.bankName}
                onChange={(e) =>
                  setNewForm({ ...newForm, bankName: e.target.value })
                }
                placeholder="e.g. JP Heritage"
                className="h-9"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">SWIFT / BIC (Optional)</Label>
              <Input
                value={newForm.swiftCode}
                onChange={(e) =>
                  setNewForm({ ...newForm, swiftCode: e.target.value })
                }
                placeholder="e.g. BOFAUS3N"
                className="h-9 font-mono uppercase"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="saveAsBeneficiary"
                type="checkbox"
                checked={newForm.saveAsBeneficiary}
                onChange={(e) =>
                  setNewForm({
                    ...newForm,
                    saveAsBeneficiary: e.target.checked,
                  })
                }
                title="Save this recipient to your address book"
                className="h-3 w-3 rounded border-slate-300 text-[color:var(--heritage-navy)]"
              />
              <Label
                htmlFor="saveAsBeneficiary"
                className="text-[11px] text-muted-foreground">
                Save this recipient to your address book
              </Label>
            </div>
            <Button
              type="submit"
              size="small"
              className="inline-flex items-center gap-2"
              disabled={isSubmitting}>
              <UserPlus className="h-3 w-3" />
              {isSubmitting ? "Saving..." : "Save recipient"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
