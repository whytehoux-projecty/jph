"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiggyBank, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Amount } from "@/components/ui/amount";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MoneyAccount } from "@/components/portal/money-fields";
import { deleteSavingsGoal } from "@/app/actions/savings";
import type { LoanProduct } from "@/lib/loan-products";
import { describeSchedule, type ContributionMode, type Frequency } from "@/lib/savings-schedule";
import { formatAmount } from "@/lib/format";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";
import { GoalDialog } from "./components/GoalDialog";
import { MoveMoneyDialog } from "./components/MoveMoneyDialog";
import { LoansTab } from "./components/LoansTab";

export interface GoalView {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  accountId: string | null;
  accountLabel: string | null;
  mode: ContributionMode;
  amount: number | null;
  frequency: Frequency | null;
  scheduleDay: number | null;
  nextContributionAt: string | null;
}

export interface LoanApplicationView {
  id: string;
  reference: string;
  loanName: string;
  amount: number;
  currency: string;
  termMonths: number | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  accountLabel: string;
}

function GoalCard({
  goal,
  locale,
  onAdd,
  onRelease,
  onEdit,
  onDelete,
  canMove,
}: {
  goal: GoalView;
  locale: string;
  onAdd: () => void;
  onRelease: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canMove: boolean;
}) {
  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
  const date = (iso: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
  const money = (n: number) => formatAmount(n, { locale }) ?? "—";
  const scheduled = goal.mode !== "NONE" && goal.frequency && goal.scheduleDay !== null && goal.amount;

  return (
    <Card className="flex h-full flex-col gap-4 p-5">
      <div>
        <h3 className="font-sans text-h5 text-fg">{goal.name}</h3>
        <p className="text-caption text-fg-muted">By {date(goal.targetDate)}</p>
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <Amount value={goal.currentAmount} locale={locale} size="lg" />
          <span className="text-small text-fg-muted">of {money(goal.targetAmount)}</span>
        </div>
        <Progress value={pct} className="mt-2" aria-label={`${goal.name}: ${pct}% saved`} />
        <p className="mt-1 text-caption text-fg-muted">{pct}% saved</p>
      </div>
      <p className="text-small text-fg">
        {scheduled ? (
          <>
            {goal.mode === "AUTO" ? "Saves" : "Reminds you to save"} {money(goal.amount!)} · {describeSchedule(goal.frequency!, goal.scheduleDay!)}
            {goal.accountLabel && <> · from {goal.accountLabel}</>}
            {goal.nextContributionAt && <span className="block text-caption text-fg-muted">Next: {date(goal.nextContributionAt)}</span>}
          </>
        ) : (
          <span className="text-fg-muted">No schedule. Add money whenever you like.</span>
        )}
      </p>
      <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-4">
        <Button size="sm" onClick={onAdd} disabled={!canMove}>
          Add money
        </Button>
        <Button size="sm" variant="secondary" onClick={onRelease} disabled={!canMove || goal.currentAmount <= 0}>
          Move money back
        </Button>
        <Button size="sm" variant="tertiary" onClick={onEdit} disabled={!canMove}>
          Change plan
        </Button>
        <Button size="sm" variant="tertiary" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}

export default function SavingsClient({
  accounts,
  goals,
  creditScore,
  loanProducts,
  loans,
  locale,
  hideBalances,
}: {
  accounts: MoneyAccount[];
  goals: GoalView[];
  creditScore: { score: number; change: number; month: string } | null;
  loanProducts: LoanProduct[];
  loans: LoanApplicationView[];
  locale: string;
  hideBalances: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = React.useState("goals");
  const [goalDialog, setGoalDialog] = React.useState<{ open: boolean; goal: GoalView | null }>({ open: false, goal: null });
  const [move, setMove] = React.useState<{ goal: GoalView; direction: "in" | "out" } | null>(null);
  const [deleting, setDeleting] = React.useState<GoalView | null>(null);
  const [busyDelete, setBusyDelete] = React.useState(false);

  const done = (message: string) => {
    toast.success({ title: message });
    router.refresh();
  };
  const canMove = accounts.length > 0;

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyDelete(true);
    try {
      const res = await deleteSavingsGoal(deleting.id);
      if (res.success) {
        setDeleting(null);
        done("Goal deleted");
      } else {
        toast.error({ title: "The goal wasn't deleted", description: res.error });
      }
    } catch (err) {
      toast.error({ title: "The goal wasn't deleted", description: userFacingError(err, "Please try again.") });
    } finally {
      setBusyDelete(false);
    }
  };

  const newGoalButton = (variant: "primary" | "secondary") => (
    <Button variant={variant} icon={<Plus aria-hidden="true" />} onClick={() => setGoalDialog({ open: true, goal: null })} disabled={!canMove}>
      New goal
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Savings and loans"
        description="Set money aside for the things you're planning, and apply for a loan."
        actions={tab === "goals" && goals.length > 0 ? newGoalButton("primary") : undefined}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Savings or loans">
          <TabsTrigger value="goals">Savings goals</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-6">
          {goals.length === 0 ? (
            <Card>
              <EmptyState
                icon={PiggyBank}
                title="Start a savings goal"
                description={
                  canMove
                    ? "Name what you're saving for and how much. Save automatically on a set day, get a reminder, or add money whenever you like."
                    : "You need an active account to save towards a goal."
                }
                action={canMove ? newGoalButton("primary") : (
                  <Button asChild variant="secondary">
                    <Link href="/vaults">Go to Accounts</Link>
                  </Button>
                )}
              />
            </Card>
          ) : (
            <>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {goals.map((g) => (
                  <li key={g.id}>
                    <GoalCard
                      goal={g}
                      locale={locale}
                      canMove={canMove}
                      onAdd={() => setMove({ goal: g, direction: "in" })}
                      onRelease={() => setMove({ goal: g, direction: "out" })}
                      onEdit={() => setGoalDialog({ open: true, goal: g })}
                      onDelete={() => setDeleting(g)}
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-small text-fg-muted">
                Money in a goal is set aside from your accounts and doesn&apos;t earn interest. Move it back to an account at any time.
              </p>
            </>
          )}
        </TabsContent>

        <TabsContent value="loans" className="mt-6">
          <LoansTab
            products={loanProducts}
            loans={loans}
            creditScore={creditScore}
            accounts={accounts}
            locale={locale}
            onSubmitted={(reference) => {
              toast.success({ title: "Application sent", description: `Reference ${reference}. We'll let you know the outcome.` });
              router.refresh();
            }}
          />
        </TabsContent>
      </Tabs>

      {canMove && (
        <GoalDialog
          open={goalDialog.open}
          onOpenChange={(open) => setGoalDialog((s) => ({ ...s, open }))}
          goal={goalDialog.goal}
          accounts={accounts}
          locale={locale}
          hideBalances={hideBalances}
          onSaved={done}
        />
      )}
      {move && (
        <MoveMoneyDialog
          direction={move.direction}
          goal={move.goal}
          onClose={() => setMove(null)}
          accounts={accounts}
          locale={locale}
          hideBalances={hideBalances}
          onDone={done}
        />
      )}

      <Dialog open={!!deleting} onOpenChange={(o) => !busyDelete && !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleting?.name}?</DialogTitle>
            <DialogDescription>
              {deleting && deleting.currentAmount > 0
                ? `This goal still holds ${formatAmount(deleting.currentAmount, { locale })}. Move it back to an account first, then delete the goal.`
                : "The goal and its schedule will be removed. Your past savings transactions stay in Activity."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busyDelete}>
              Cancel
            </Button>
            {deleting && deleting.currentAmount > 0 ? (
              <Button
                onClick={() => {
                  const g = deleting;
                  setDeleting(null);
                  setMove({ goal: g, direction: "out" });
                }}
              >
                Move money back
              </Button>
            ) : (
              <Button variant="destructive" onClick={confirmDelete} loading={busyDelete} loadingLabel="Deleting the goal">
                Delete goal
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
