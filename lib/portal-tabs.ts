import { LayoutDashboard, ArrowLeftRight, Download, PiggyBank, Gift } from "lucide-react";

export const portalTabs = [
  { label: "Overview", route: "/dashboard", icon: LayoutDashboard },
  { label: "Transfer & Payment", route: "/transfer", icon: ArrowLeftRight },
  { label: "Deposits", route: "/deposit", icon: Download },
  { label: "Savings & Loans", route: "/savings", icon: PiggyBank },
  { label: "Benefits & Rewards", route: "/benefits", icon: Gift },
];
