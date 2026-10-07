import { Wallet, ArrowLeftRight, Download, FileText, Receipt } from "lucide-react";

export const portalTabs = [
  { label: "Vaults & Cards", route: "/vaults", icon: Wallet },
  { label: "Transfers & Pay Bills", route: "/transfer", icon: ArrowLeftRight },
  { label: "Deposits", route: "/deposit", icon: Download },
  { label: "Savings & Loans", route: "/savings", icon: FileText },
  { label: "Activities", route: "/activities", icon: Receipt },
];
