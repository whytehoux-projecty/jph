import type { Status } from "@/components/ui/badge";

const STATUS: Record<string, { label: string; status: Status }> = {
  FROZEN: { label: "Frozen", status: "danger" },
  SUSPENDED: { label: "Suspended", status: "danger" },
  CLOSED: { label: "Closed", status: "neutral" },
  PENDING: { label: "Opening", status: "warning" },
  DORMANT: { label: "Dormant", status: "warning" },
};

/** Status pill for an account, or null when the account is simply active. */
export function accountStatus(status: string): { label: string; status: Status } | null {
  if (status === "ACTIVE") return null;
  return (
    STATUS[status] ?? {
      label: status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " "),
      status: "neutral",
    }
  );
}
