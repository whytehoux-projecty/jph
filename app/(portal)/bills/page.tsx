import { getAccounts } from "@/app/actions/accounts";
import { getProviders, getBillHistory, getUserBillPermissions, type BillProvider, type UserBillPermissions } from "@/app/actions/bills";
import BillsClient from "./BillsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
  let accounts: any[] = [];
  let providers: BillProvider[] = [];
  let history: any[] = [];
  let permissions: UserBillPermissions = {
    enabled: true,
    methods: { providers: true, einvoice: true },
  };

  try {
    const [rawAccounts, rawProviders, rawHistory, userPermissions] = await Promise.all([
      getAccounts(),
      getProviders(),
      getBillHistory().catch(() => []),
      getUserBillPermissions().catch(() => ({
        enabled: true,
        methods: { providers: true, einvoice: true },
      })),
    ]);

    accounts = (rawAccounts || []).map((acc: any) => ({
      id: acc.id,
      name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
      accountType: acc.accountType,
      balance: acc.balance,
      accountNumber: acc.accountNumber,
      currency: acc.currency || "USD",
    }));

    providers = rawProviders || [];
    history = rawHistory || [];
    permissions = userPermissions;
  } catch (error) {
    redirect("/login");
  }

  return (
    <BillsClient
      initialAccounts={accounts}
      initialProviders={providers}
      initialHistory={history}
      permissions={permissions}
    />
  );
}
