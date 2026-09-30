import {
  RecentAlertsWidget,
  AccountSwitcherWidget,
  CreditScoreWidget,
  BudgetWidget,
  CashFlowProjectionWidget,
  UpcomingBillsWidget,
  FinancialTipWidget,
} from "@/components/dashboard/RightSidebarWidgets";

export interface SidebarRegistryItem {
  id: string;
  label: string;
  component: React.ComponentType;
  defaultVisibility: boolean;
  scope: "global" | "per-customer";
}

export const SIDEBAR_REGISTRY: SidebarRegistryItem[] = [
  {
    id: "recent-alerts",
    label: "Recent Alerts",
    component: RecentAlertsWidget,
    defaultVisibility: true,
    scope: "per-customer",
  },
  {
    id: "account-switcher",
    label: "Account Switcher",
    component: AccountSwitcherWidget,
    defaultVisibility: true,
    scope: "per-customer",
  },
  {
    id: "credit-score",
    label: "Credit Score",
    component: CreditScoreWidget,
    defaultVisibility: true,
    scope: "per-customer",
  },
  {
    id: "budget",
    label: "Budget",
    component: BudgetWidget,
    defaultVisibility: true,
    scope: "per-customer",
  },
  {
    id: "cash-flow",
    label: "Cash Flow Projection",
    component: CashFlowProjectionWidget,
    defaultVisibility: true,
    scope: "per-customer",
  },
  {
    id: "upcoming-bills",
    label: "Upcoming Bills",
    component: UpcomingBillsWidget,
    defaultVisibility: true,
    scope: "per-customer",
  },
  {
    id: "financial-tip",
    label: "Financial Tip",
    component: FinancialTipWidget,
    defaultVisibility: true,
    scope: "global",
  },
];
