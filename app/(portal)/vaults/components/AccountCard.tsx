"use client";

import Link from "next/link";
import { ArrowLeftRight, ChevronRight, MoreHorizontal, Repeat, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, StatusPill } from "@/components/ui/badge";
import { AccountNumber } from "@/components/ui/account-number";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VisibleAmount } from "@/components/dashboard/balance-visibility";
import { accountStatus } from "../account-status";
import type { AccountView } from "../AccountsClient";

export function AccountCard({
  account,
  locale,
  onRequestPrimary,
  onRequestSwap,
}: {
  account: AccountView;
  locale: string;
  onRequestPrimary: () => void;
  onRequestSwap: () => void;
}) {
  const status = accountStatus(account.status);
  const canAskPrimary = account.canBePrimary && !account.isPrimary && !account.isExternal && account.status === "ACTIVE";

  return (
    <Card interactive className="relative flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 p-5 pb-0">
        <div className="min-w-0">
          <h3 className="font-sans text-h5 text-fg">
            <Link
              href={`/vaults/${account.id}`}
              className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
            >
              {account.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-small text-fg-muted">
            <AccountNumber value={account.accountNumber} label={account.name} />
          </p>
        </div>
        <div className="relative z-(--z-raised) -mr-2 -mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`More actions for ${account.name}`}
              className="flex size-11 items-center justify-center rounded-control text-fg-muted hover:bg-surface-muted hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
            >
              <MoreHorizontal className="size-5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {!account.isExternal && (
                <DropdownMenuItem asChild>
                  <Link href="/transfer">
                    <ArrowLeftRight aria-hidden="true" />
                    Make a transfer
                  </Link>
                </DropdownMenuItem>
              )}
              {canAskPrimary && (
                <DropdownMenuItem onSelect={onRequestPrimary}>
                  <Star aria-hidden="true" />
                  Make this my primary account
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={onRequestSwap}>
                <Repeat aria-hidden="true" />
                Replace this account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 px-5 pt-3">
        {account.isPrimary && <Badge variant="default">Primary</Badge>}
        {account.isExternal && <Badge variant="outline">Linked</Badge>}
        {status && <StatusPill status={status.status}>{status.label}</StatusPill>}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 p-5 pt-4">
        <div>
          <p className="text-caption text-fg-muted">{account.isExternal ? "Last reported balance" : "Balance"}</p>
          <VisibleAmount value={account.balance} currency={account.currency} locale={locale} size="lg" />
        </div>
        <ChevronRight className="mb-1 size-5 text-fg-muted" aria-hidden="true" />
      </div>
    </Card>
  );
}
