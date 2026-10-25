import type { Status } from "@/components/ui/badge";

/** A transaction as the Activity screen shows it (serialisable). */
export interface ActivityRow {
  id: string;
  reference: string;
  description: string;
  type: "CREDIT" | "DEBIT";
  transactionType: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  accountId: string;
  accountLast4: string;
  category: string | null;
  note: string | null;
  channel: string | null;
  counterparty: string | null;
  runningBalance: number | null;
}

function parseJson(value: string | null | undefined): any {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/** Server → client mapping. Category and note edits are stored in metadata. */
export function toActivityRow(t: any): ActivityRow {
  const meta = parseJson(t.metadata) ?? {};
  const cp = parseJson(t.counterparty);
  const counterparty =
    typeof cp === "string" ? cp : cp?.name ?? cp?.beneficiaryName ?? cp?.accountName ?? null;
  const notesArr = parseJson(t.notes);
  const lastNote = Array.isArray(notesArr) && notesArr.length ? notesArr[notesArr.length - 1] : null;
  return {
    id: t.id,
    reference: t.reference,
    description: t.description,
    type: t.type === "CREDIT" ? "CREDIT" : "DEBIT",
    transactionType: t.transactionType,
    amount: Math.abs(Number(t.amount)),
    currency: t.currency || t.account?.currency || "USD",
    status: t.status,
    createdAt: (t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt)).toISOString(),
    accountId: t.accountId,
    accountLast4: String(t.account?.accountNumber ?? "").slice(-4),
    category: meta.category ?? t.category ?? null,
    note: meta.note ?? (typeof lastNote === "string" ? lastNote : lastNote?.text ?? null),
    channel: t.channel ?? null,
    counterparty,
    runningBalance: typeof t.runningBalance === "number" ? t.runningBalance : null,
  };
}

export const TX_STATUS: Record<string, { label: string; status: Status }> = {
  PENDING: { label: "Pending", status: "warning" },
  ON_HOLD: { label: "On hold", status: "warning" },
  PROCESSING: { label: "Processing", status: "info" },
  APPROVED: { label: "Completed", status: "success" },
  COMPLETED: { label: "Completed", status: "success" },
  REJECTED: { label: "Declined", status: "danger" },
  FAILED: { label: "Failed", status: "danger" },
  CANCELLED: { label: "Cancelled", status: "neutral" },
  DISPUTED: { label: "Disputed", status: "info" },
};

export function txStatus(status: string) {
  return TX_STATUS[status] ?? { label: status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " "), status: "neutral" as Status };
}

export function humanizeType(value: string) {
  const s = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const CATEGORIES = [
  "General", "Income", "Shopping", "Dining", "Groceries", "Utilities", "Transportation",
  "Health", "Entertainment", "Services", "Transfer", "Interest",
];
