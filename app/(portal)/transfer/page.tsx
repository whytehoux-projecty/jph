import { Suspense } from "react";
import { getAccounts } from "@/app/actions/accounts";
import { getEnabledUserTransferMethods, getTransferMethodConfigs } from "@/app/actions/transferConfig";
import { TransferHub } from "@/components/transfer/TransferHub";
import { loadOrSignIn } from "@/lib/portal-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Transfers" };

export default async function TransferPage() {
  const raw = await loadOrSignIn(() => getAccounts());
  // Only the bank's own, active accounts can send money.
  const accounts = raw
    .filter((a) => !a.isExternal && a.status === "ACTIVE")
    .map((a) => ({
      id: a.id,
      accountNumber: a.accountNumber,
      accountType: a.accountType,
      balance: Number(a.balance),
      currency: a.currency,
    }));

  let enabled: any[] = [];
  let all: any[] = [];
  try {
    [enabled, all] = await Promise.all([getEnabledUserTransferMethods(), getTransferMethodConfigs()]);
  } catch {
    // Without configuration rows every method is treated as available (as before).
  }

  // A method is available only if the admin left it enabled and visible for this user.
  // Methods with no config row are treated as available.
  const methodConfigs = all.map((row: any) => {
    const e = enabled.find((m: any) => m.methodId === row.methodId);
    return {
      methodId: row.methodId,
      isEnabled: !!e,
      isVisibleToUser: !!e,
      isBlockedByAdmin: !!e?.isBlockedByAdmin,
      processingTime: row.processingTime || undefined,
      perTransferLimit: row.perTransferLimit || undefined,
    };
  });

  return (
    <Suspense fallback={null}>
      <TransferHub accounts={accounts} methodConfigs={methodConfigs} />
    </Suspense>
  );
}
