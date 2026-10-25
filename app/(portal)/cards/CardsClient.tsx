"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill, type Status } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { CardFace } from "@/components/cards/CardFace";
import { freezeCard, revealCardDetails, unfreezeCard } from "@/app/actions/cards";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { CardLimitsControl } from "./components/CardLimitsControl";

export interface CardView {
  id: string;
  last4: string;
  expiry: string;
  type: string;
  network: string;
  tier: string | null;
  status: string;
  imageUrl: string | null;
  dailyLimit: number | null;
  currency: string;
  accountId: string;
  accountLabel: string | null;
  holderName: string;
}

const CARD_STATUS: Record<string, { label: string; status: Status }> = {
  ACTIVE: { label: "Active", status: "success" },
  FROZEN: { label: "Frozen", status: "info" },
  BLOCKED: { label: "Blocked", status: "danger" },
  EXPIRED: { label: "Expired", status: "neutral" },
  CANCELLED: { label: "Cancelled", status: "neutral" },
};

const REVEAL_MS = 30_000;

export default function CardsClient({ cards }: { cards: CardView[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(cards[0]?.id ?? null);
  const [frozenOverride, setFrozenOverride] = useState<Record<string, boolean>>({});
  const [freezing, setFreezing] = useState(false);
  const [revealed, setRevealed] = useState<{ id: string; number: string; expiry: string; cvv: string } | null>(null);
  const [revealing, setRevealing] = useState(false);

  const card = cards.find((c) => c.id === selectedId) ?? null;
  const frozen = card ? frozenOverride[card.id] ?? card.status === "FROZEN" : false;
  const st = card ? (frozen ? CARD_STATUS.FROZEN : CARD_STATUS[card.status] ?? { label: card.status, status: "neutral" as Status }) : null;
  const canManage = card ? card.status === "ACTIVE" || card.status === "FROZEN" : false;
  const isRevealed = revealed && card && revealed.id === card.id;

  // Full details hide themselves again after 30 seconds, and when switching card.
  useEffect(() => {
    if (!revealed) return;
    const t = window.setTimeout(() => setRevealed(null), REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [revealed]);
  useEffect(() => setRevealed(null), [selectedId]);

  const toggleFreeze = async (next: boolean) => {
    if (!card) return;
    setFreezing(true);
    setFrozenOverride((p) => ({ ...p, [card.id]: next }));
    try {
      if (next) await freezeCard(card.id);
      else await unfreezeCard(card.id);
      toast.success(
        next
          ? { title: "Card frozen", description: "New payments with this card will be declined until you unfreeze it." }
          : { title: "Card unfrozen", description: "You can use this card again." },
      );
      router.refresh();
    } catch (err) {
      setFrozenOverride((p) => ({ ...p, [card.id]: !next }));
      toast.error({ title: "We couldn't change the card", description: userFacingError(err, "Please try again.") });
    } finally {
      setFreezing(false);
    }
  };

  const toggleReveal = async () => {
    if (!card) return;
    if (isRevealed) return setRevealed(null);
    setRevealing(true);
    try {
      const d = await revealCardDetails(card.id);
      setRevealed({ id: card.id, ...d });
    } catch (err) {
      toast.error({ title: "We couldn't show the card details", description: userFacingError(err, "Please try again.") });
    } finally {
      setRevealing(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Cards"
        description="Your debit and credit cards: details, freezing and limits."
      />

      {cards.length === 0 ? (
        <Card>
          <EmptyState
            icon={CreditCard}
            title="You don't have a card yet"
            description="Contact us and we'll help you get a debit or credit card linked to one of your accounts."
            action={
              <Button asChild>
                <Link href="/support">Contact us</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {cards.length > 1 && (
            <nav aria-label="Your cards" className="lg:col-span-12">
              <ul className="flex gap-2 overflow-x-auto pb-1">
                {cards.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      aria-current={c.id === selectedId ? "true" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-2 whitespace-nowrap rounded-control border px-3 text-small transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                        c.id === selectedId ? "border-action bg-action-subtle font-semibold text-fg" : "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg",
                      )}
                    >
                      <CreditCard className="size-4" aria-hidden="true" />
                      {c.type} •••• {c.last4}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {card && st && (
            <>
              <div className="flex flex-col gap-4 lg:col-span-5">
                <CardFace
                  last4={card.last4}
                  expiry={card.expiry}
                  network={card.network}
                  type={card.type}
                  tier={card.tier}
                  holderName={card.holderName}
                  imageUrl={card.imageUrl}
                  frozen={frozen}
                />
              </div>

              <div className="flex flex-col gap-6 lg:col-span-7">
                <Card className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-sans text-h4 text-fg">
                      {card.type} card ending {card.last4}
                    </h2>
                    <StatusPill status={st.status}>{st.label}</StatusPill>
                  </div>
                  <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    <Detail term="Card number">
                      <span className="tabular-nums">{isRevealed ? revealed!.number.replace(/(\d{4})(?=\d)/g, "$1 ") : `•••• •••• •••• ${card.last4}`}</span>
                    </Detail>
                    <Detail term="Expires">
                      <span className="tabular-nums">{card.expiry}</span>
                    </Detail>
                    <Detail term="Security code (CVV)">
                      <span className="tabular-nums">{isRevealed ? revealed!.cvv : "•••"}</span>
                    </Detail>
                    <Detail term="Network">{card.network}</Detail>
                    {card.accountLabel && (
                      <Detail term="Linked account">
                        <Link href={`/vaults/${card.accountId}`} className="text-fg-action underline underline-offset-[3px]">
                          {card.accountLabel}
                        </Link>
                      </Detail>
                    )}
                  </dl>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={toggleReveal}
                      loading={revealing}
                      loadingLabel="Getting card details"
                      aria-pressed={!!isRevealed}
                      icon={isRevealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                      disabled={!canManage}
                    >
                      {isRevealed ? "Hide card details" : "Show card details"}
                    </Button>
                    <p className="text-caption text-fg-muted" aria-live="polite">
                      {isRevealed ? "Details hide again after 30 seconds." : "Only show your card details where no one can see your screen."}
                    </p>
                  </div>
                </Card>

                {canManage ? (
                  <Card className="flex flex-col gap-6 p-5 sm:p-6">
                    <h2 className="font-sans text-h4 text-fg">Controls</h2>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Label htmlFor="freeze-card">Freeze card</Label>
                        <p id="freeze-card-desc" className="mt-1 text-small text-fg-muted">
                          New payments are declined while the card is frozen. Unfreeze it at any time.
                        </p>
                      </div>
                      <Switch
                        id="freeze-card"
                        aria-describedby="freeze-card-desc"
                        checked={frozen}
                        disabled={freezing}
                        onCheckedChange={toggleFreeze}
                      />
                    </div>
                    <div className="border-t border-line pt-6">
                      <CardLimitsControl cardId={card.id} dailyLimit={card.dailyLimit} currency={card.currency} disabled={frozen} />
                    </div>
                  </Card>
                ) : (
                  <Alert variant="info" title={`This card is ${st.label.toLowerCase()}`}>
                    It can't be used or changed. Contact us if you need a replacement.
                  </Alert>
                )}

                <p className="text-small text-fg-muted">
                  Card payments appear with your other transactions in{" "}
                  <Link href="/activities" className="font-semibold text-fg-action underline underline-offset-[3px]">
                    Activity
                  </Link>
                  . If your card is lost or stolen, freeze it here straight away, then{" "}
                  <Link href="/support" className="font-semibold text-fg-action underline underline-offset-[3px]">
                    contact us
                  </Link>
                  .
                </p>
              </div>
            </>
          )}
        </div>
      )}

    </>
  );
}

function Detail({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-caption text-fg-muted">{term}</dt>
      <dd className="mt-0.5 text-body text-fg">{children}</dd>
    </div>
  );
}
