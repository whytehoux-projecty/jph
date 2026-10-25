"use client";

import { useTransition } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { endStaffView, type StaffViewState } from "@/app/actions/staff-view";

/** Always visible while an administrator is viewing a customer's portal. */
export function StaffViewBanner({ state }: { state: StaffViewState }) {
  const [pending, startTransition] = useTransition();

  return (
    <div role="status" className="bg-surface-inverse text-fg-inverse">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 lg:px-8">
        <p className="flex min-w-0 flex-1 items-center gap-2 text-small">
          <Eye className="size-4 shrink-0 text-action-on-inverse" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Staff view.</strong> You&rsquo;re seeing {state.customerName}&rsquo;s online
            banking{state.staffName ? ` as ${state.staffName}` : ""}. It ends when your admin session does.
          </span>
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="border-fg-inverse bg-transparent text-fg-inverse hover:bg-line-inverse"
          loading={pending}
          loadingLabel="Returning to admin"
          onClick={() => startTransition(() => endStaffView())}
        >
          Return to admin
        </Button>
      </div>
    </div>
  );
}
