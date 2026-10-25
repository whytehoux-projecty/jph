"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MoreHorizontal, Pencil, Plus, Search, Send, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill, type Status } from "@/components/ui/badge";
import { BrandIcon, getBrandIconSrc } from "@/components/ui/BrandIcon";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DynamicBeneficiaryForm } from "@/components/beneficiaries/DynamicBeneficiaryForm";
import { beneficiaryRails } from "@/lib/beneficiary-rails";
import { createBeneficiary, deleteBeneficiary, updateBeneficiary } from "@/app/actions/beneficiaries";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";

interface Beneficiary {
  id: string;
  name: string;
  nickname?: string;
  rail: string;
  details: string;
  status: string;
  isInternal: boolean;
}

const STATUS: Record<string, { label: string; status: Status }> = {
  ACTIVE: { label: "Active", status: "success" },
  VERIFIED: { label: "Verified", status: "success" },
  PENDING: { label: "Pending review", status: "warning" },
  BLOCKED: { label: "Blocked", status: "danger" },
};

/** Where "Pay" goes for each payment method. */
function payHref(b: Beneficiary): string {
  if (b.isInternal || b.rail === "internal") return "/transfer?type=internal&method=other";
  switch (b.rail) {
    case "wire_domestic":
    case "ach":
    case "fednow":
      return `/transfer?type=wire&method=${b.rail}`;
    case "us_bank":
      return "/transfer?type=wire";
    case "wire_international":
    case "swift":
    case "uk_bank":
      return "/transfer?type=wire&method=wire_international";
    case "crypto":
      return "/transfer?type=wallet";
    case "zelle":
    case "cashapp":
    case "venmo":
      return `/transfer?type=p2p&method=${b.rail}`;
    default:
      return "/transfer";
  }
}

function mask(value: string) {
  return value.replace(/[a-zA-Z0-9](?=(?:[^a-zA-Z0-9]*[a-zA-Z0-9]){4})/g, "•");
}

export default function BeneficiariesClient({ initialBeneficiaries }: { initialBeneficiaries: Beneficiary[] }) {
  const router = useRouter();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Beneficiary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return beneficiaries;
    return beneficiaries.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.nickname ?? "").toLowerCase().includes(q) ||
        (beneficiaryRails[b.rail]?.displayName ?? "").toLowerCase().includes(q),
    );
  }, [beneficiaries, query]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const save = async (data: any) => {
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await updateBeneficiary(editing.id, data);
        setBeneficiaries((prev) => prev.map((b) => (b.id === editing.id ? (updated as Beneficiary) : b)));
        toast.success({ title: "Payee updated" });
      } else {
        const created = await createBeneficiary(data);
        setBeneficiaries((prev) => [created as Beneficiary, ...prev]);
        toast.success({ title: "Payee added", description: `You can now pay ${data.name} from Transfers.` });
      }
      setFormOpen(false);
      setEditing(null);
      router.refresh();
    } catch (err) {
      toast.error({ title: "The payee wasn't saved", description: userFacingError(err, "Please check the details and try again.") });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBeneficiary(deleteTarget.id);
      setBeneficiaries((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast.success({ title: "Payee removed" });
      router.refresh();
      setDeleteTarget(null);
    } catch (err) {
      toast.error({ title: "The payee wasn't removed", description: userFacingError(err, "Please try again.") });
    } finally {
      setDeleting(false);
    }
  };

  const toggleReveal = (id: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <>
      <PageHeader
        title="Payees"
        description="People and businesses you pay. Saving them means you don't have to enter their details again."
        actions={
          <Button icon={<Plus aria-hidden="true" />} onClick={openAdd}>
            Add a payee
          </Button>
        }
      />

      {beneficiaries.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="You haven't saved any payees yet"
            description="Add a payee once and you can pay them again in a few steps."
            action={<Button onClick={openAdd}>Add a payee</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="relative mb-4 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
            <Input
              type="search"
              aria-label="Search payees"
              placeholder="Name, nickname or payment method"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="sr-only" aria-live="polite">
            Showing {filtered.length} of {beneficiaries.length} payees.
          </p>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                compact
                icon={Search}
                title="No payees match your search"
                description={`Nothing matches “${query}”.`}
                action={<Button variant="secondary" onClick={() => setQuery("")}>Clear search</Button>}
              />
            </Card>
          ) : (
            <Card>
              <Table stackOnMobile>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Payee</TableHead>
                    <TableHead>Payment method</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-0">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b) => {
                    const rail = beneficiaryRails[b.rail || "us_bank"];
                    let details: Record<string, string> = {};
                    try {
                      details = JSON.parse(b.details || "{}");
                    } catch {}
                    const account = rail ? rail.getDisplayAccount(details) : "";
                    const isRevealed = revealed.has(b.id);
                    const st = STATUS[b.status] ?? { label: b.status, status: "neutral" as Status };
                    return (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getBrandIconSrc(b.rail) ? (
                              <BrandIcon name={b.rail} size={28} alt="" />
                            ) : (
                              <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-round bg-surface-selected text-small font-semibold text-fg-action">
                                {b.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                            <span>
                              <span className="block text-body font-semibold text-fg">{b.name}</span>
                              {b.nickname && <span className="block text-caption text-fg-muted">{b.nickname}</span>}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell label="Payment method">{rail?.displayName ?? b.rail}</TableCell>
                        <TableCell label="Account">
                          {account ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="tabular-nums">{isRevealed ? account : mask(account)}</span>
                              <button
                                type="button"
                                onClick={() => toggleReveal(b.id)}
                                aria-pressed={isRevealed}
                                aria-label={isRevealed ? `Hide ${b.name}'s account details` : `Show ${b.name}'s account details`}
                                className="-my-2 flex size-9 items-center justify-center rounded-control text-fg-muted hover:bg-surface-muted hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
                              >
                                {isRevealed ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                              </button>
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell label="Status">
                          <StatusPill status={st.status}>{st.label}</StatusPill>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button asChild size="sm" variant="secondary" icon={<Send aria-hidden="true" />}>
                              <Link href={payHref(b)}>Pay</Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label={`More actions for ${b.name}`}
                                className="flex size-11 items-center justify-center rounded-control text-fg-muted hover:bg-surface-muted hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
                              >
                                <MoreHorizontal className="size-5" aria-hidden="true" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setEditing(b);
                                    setFormOpen(true);
                                  }}
                                >
                                  <Pencil aria-hidden="true" />
                                  Edit details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => setDeleteTarget(b)} className="text-danger focus:bg-danger-subtle">
                                  <Trash2 aria-hidden="true" />
                                  Remove payee
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(o) => {
          if (!o && !submitting) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit payee" : "Add a payee"}</DialogTitle>
            <DialogDescription>
              {editing ? "Changes apply to future payments only." : "Check the details carefully. Money sent to the wrong account can be hard to recover."}
            </DialogDescription>
          </DialogHeader>
          <DynamicBeneficiaryForm
            key={editing?.id ?? "new"}
            initialData={editing ?? undefined}
            onSubmit={save}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}>
        <DialogContent role="alertdialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              They'll be removed from your payees. Payments you've already made aren't affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Keep payee
            </Button>
            <Button variant="destructive" onClick={confirmDelete} loading={deleting} loadingLabel="Removing payee">
              Remove payee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
