import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAccounts } from "@/app/actions/accounts";
import { getEnabledUserTransferMethods, getTransferMethodConfigs } from "@/app/actions/transferConfig";
import { TransferHub } from "@/components/transfer/TransferHub";

export const dynamic = "force-dynamic";

export default async function TransferSendPage() {
  let accounts;

  try {
    const raw = await getAccounts();
    accounts = raw.map((a: any) => ({
      id: a.id,
      accountNumber: a.accountNumber,
      accountType: a.accountType,
      balance: a.balance,
      currency: a.currency,
    }));
  } catch {
    redirect("/login");
  }

  let enabled: any[] = [];
  let all: any[] = [];
  try {
    [enabled, all] = await Promise.all([getEnabledUserTransferMethods(), getTransferMethodConfigs()]);
  } catch {
    enabled = [];
    all = [];
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
      processingTime: row.processingTime,
      perTransferLimit: row.perTransferLimit,
    };
  });

  return (
    <Suspense fallback={null}>
      <TransferHub accounts={accounts} methodConfigs={methodConfigs} />
    </Suspense>
  );
}
