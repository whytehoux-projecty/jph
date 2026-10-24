"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FilePlus2, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateStatementDialog } from "./CreateStatementDialog";

export interface StatementRow {
  id: string;
  period: string; // YYYY-MM
  periodLabel: string;
  issuedLabel: string;
  accountId: string;
  accountLabel: string;
}

export default function StatementsClient({
  statements,
  accounts,
  allAccounts,
  locale,
}: {
  statements: StatementRow[];
  /** Accounts that have statements (for the filter). */
  accounts: Array<{ id: string; label: string }>;
  /** All the customer's own accounts (for creating a statement). */
  allAccounts: Array<{ id: string; label: string }>;
  locale: string;
}) {
  const [accountId, setAccountId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const visible = useMemo(
    () => (accountId ? statements.filter((s) => s.accountId === accountId) : statements),
    [statements, accountId],
  );

  return (
    <>
      <PageHeader
        title="Statements"
        description="Monthly statements for your accounts. Open one to view, print or save it as a PDF."
        actions={
          allAccounts.length > 0 ? (
            <Button icon={<FilePlus2 aria-hidden="true" />} onClick={() => setCreateOpen(true)}>
              Create a statement
            </Button>
          ) : undefined
        }
      />

      {statements.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No statements yet"
            description="Create a statement for any of the last 12 months, or download your transactions for any dates from Activity."
            action={
              <>
                {allAccounts.length > 0 && <Button onClick={() => setCreateOpen(true)}>Create a statement</Button>}
                <Button asChild variant="secondary">
                  <Link href="/activities">Go to Activity</Link>
                </Button>
              </>
            }
          />
        </Card>
      ) : (
        <>
          {accounts.length > 1 && (
            <div className="mb-4 max-w-sm">
              <FormField label="Account">
                <NativeSelect value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  <option value="">All accounts</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </NativeSelect>
              </FormField>
            </div>
          )}

          {visible.length === 0 ? (
            <Card>
              <EmptyState
                compact
                icon={FileText}
                title="No statements for this account yet"
                action={<Button variant="secondary" onClick={() => setAccountId("")}>Show all accounts</Button>}
              />
            </Card>
          ) : (
            <Card>
              <Table stackOnMobile>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Period</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead className="w-0">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <span className="flex items-center gap-2 text-body font-semibold text-fg">
                          <FileText className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
                          {s.periodLabel}
                        </span>
                      </TableCell>
                      <TableCell label="Account">{s.accountLabel}</TableCell>
                      <TableCell label="Issued" className="text-fg-muted">{s.issuedLabel}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/statements/${s.id}`} aria-label={`View ${s.periodLabel} statement for ${s.accountLabel}`}>
                            View statement
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
          <p className="mt-4 text-small text-fg-muted">
            Need a record for a different period? Download your transactions for any dates from{" "}
            <Link href="/activities" className="font-semibold text-fg-action underline underline-offset-[3px]">
              Activity
            </Link>
            .
          </p>
        </>
      )}

      {createOpen && (
        <CreateStatementDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          accounts={allAccounts}
          existing={statements.map((s) => ({ id: s.id, accountId: s.accountId, period: s.period }))}
          locale={locale}
        />
      )}
    </>
  );
}
