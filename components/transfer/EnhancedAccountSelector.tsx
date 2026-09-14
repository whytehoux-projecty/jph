import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { getProfile } from "@/app/actions/profile";
import { getAccounts } from "@/app/actions/accounts";
import { formatCurrency, languageToLocale } from "@/lib/utils";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { Wallet, CreditCard, PiggyBank, Landmark } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

interface EnhancedAccount {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  availableBalance?: number;
  currency: string;
  name?: string;
}

interface EnhancedAccountSelectorProps {
  value: string;
  onChange: (accountId: string) => void;
  label?: string;
  excludeAccountIds?: string[];
}

export function EnhancedAccountSelector({
  value,
  onChange,
  label = "From Account",
  excludeAccountIds = [],
}: EnhancedAccountSelectorProps) {
  const [accounts, setAccounts] = useState<EnhancedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState({
    language: "en",
    currency: "USD",
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const response = await getProfile();
        const user = response;
        if (!user) return;
        setUserPreferences((prev) => ({
          ...prev,
          language: user.preferredLanguage || prev.language,
          currency: user.preferredCurrency || prev.currency,
        }));
      } catch {
      }
    };

    loadUserPreferences();
  }, []);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAccounts();
      const raw = Array.isArray(data) ? data : [];
      const filtered = (raw as EnhancedAccount[]).filter(
        (acc) => !excludeAccountIds.includes(acc.id),
      );
      setAccounts(filtered);
      if (!value && filtered.length > 0) {
        onChange(filtered[0].id);
      }
    } catch (err: any) {
      setError("Failed to load accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === value) || null,
    [accounts, value],
  );

  const locale = languageToLocale(userPreferences.language);

  const formatMoney = (amount: number, currency: string) => {
    return formatCurrency(
      amount,
      currency || userPreferences.currency,
      locale,
    );
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return "";
    const suffix = accountNumber.slice(-4);
    return "••••" + suffix;
  };

  const getAccountIcon = (type: string) => {
    if (type === "SAVINGS") return PiggyBank;
    if (type === "CHECKING") return Wallet;
    if (type === "CREDIT") return CreditCard;
    return Landmark;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-charcoal">{label}</p>
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-charcoal">{label}</p>
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadAccounts}
            className="rounded-md bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!accounts.length) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-charcoal">{label}</p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-muted-foreground space-y-1">
          <p>No accounts are available for transfers from this profile.</p>
          <p>
            Open or fund an account to start sending transfers from this
            dashboard.
          </p>
        </div>
      </div>
    );
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
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
    if (!accounts.length) return;
    const direction = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
    let targetIndex = index;
    for (let i = 0; i < accounts.length; i += 1) {
      targetIndex =
        (targetIndex + direction + accounts.length) % accounts.length;
      const candidate = accounts[targetIndex];
      if (!candidate) continue;
      onChange(candidate.id);
      const element = document.getElementById(
        `enhanced-account-${candidate.id}`,
      ) as HTMLButtonElement | null;
      if (element) {
        element.focus();
      }
      break;
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-charcoal">{label}</p>
      <div className="grid grid-cols-1 gap-3">
        {accounts.map((account, index) => {
          const isSelected = account.id === value;
          const available =
            typeof account.availableBalance === "number"
              ? account.availableBalance
              : account.balance;
          return (
            <button
              key={account.id}
              id={`enhanced-account-${account.id}`}
              type="button"
              onClick={() => onChange(account.id)}
              className={`w-full text-left transition ${
                isSelected
                  ? "ring-2 ring-[color:var(--heritage-navy)] ring-offset-2 ring-offset-slate-50"
                  : ""
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50`}
              tabIndex={isSelected ? 0 : -1}
              onKeyDown={(event) => handleKeyDown(event, index)}>
              <Card className="flex items-center justify-between gap-3 border border-slate-200 px-3 py-3 shadow-none hover:border-soft-gold/70 hover:shadow-vintage-md">
                <div className="flex items-center gap-3">
                  <VintageIcon
                    icon={getAccountIcon(account.accountType)}
                    size="sm"
                    variant={isSelected ? "gold" : "charcoal"}
                  />
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-charcoal">
                      {account.name || account.accountType}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {maskAccountNumber(account.accountNumber)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Available</div>
                  <div className="text-sm font-semibold text-charcoal">
                    {formatMoney(available, account.currency)}
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
