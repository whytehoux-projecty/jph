"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, Landmark, Smartphone, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatAmount } from "@/lib/format";
import { TRANSFER_TYPES, type TransferTypeDef } from "@/lib/transfer-forms/schema";
import { TransferFormEngine, type PortalAccount } from "./TransferFormEngine";
import { RecentRequests } from "./LiveStatus";

export interface MethodConfigLite {
  methodId: string;
  isEnabled: boolean;
  isVisibleToUser: boolean;
  isBlockedByAdmin?: boolean;
  processingTime?: string;
  perTransferLimit?: number;
}

const TYPE_ICONS: Record<TransferTypeDef["illustration"], React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  internal: ArrowLeftRight,
  wire: Landmark,
  wallet: Wallet,
  p2p: Smartphone,
};

export function TransferHub({ accounts, methodConfigs }: { accounts: PortalAccount[]; methodConfigs: MethodConfigLite[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [refreshKey, setRefreshKey] = React.useState(0);

  const cfg = React.useMemo(() => Object.fromEntries(methodConfigs.map((c) => [c.methodId, c])), [methodConfigs]);

  // Admin-controlled availability: hide methods that are disabled, hidden or blocked.
  const types: TransferTypeDef[] = React.useMemo(() => {
    const available = (methodId: string) => {
      const c = cfg[methodId];
      return !c || (c.isEnabled && c.isVisibleToUser && !c.isBlockedByAdmin);
    };
    return TRANSFER_TYPES.map((t) => {
      const variants = Object.fromEntries(Object.entries(t.variants).filter(([, v]) => available(v.methodId)));
      return { ...t, variants, gate: { ...t.gate, options: t.gate.options.filter((o) => variants[o.value]) } };
    }).filter((t) => Object.keys(t.variants).length > 0);
  }, [cfg]);

  const limitOverrides = React.useMemo(
    () => Object.fromEntries(methodConfigs.filter((c) => c.perTransferLimit).map((c) => [c.methodId, c.perTransferLimit!])),
    [methodConfigs],
  );
  const processingTimes = React.useMemo(
    () => Object.fromEntries(methodConfigs.filter((c) => c.processingTime).map((c) => [c.methodId, c.processingTime!])),
    [methodConfigs],
  );

  const activeId = types.find((t) => t.id === params.get("type"))?.id ?? types[0]?.id;
  const active = types.find((t) => t.id === activeId) ?? null;
  const rawGate = params.get("method");
  const gate = active && rawGate && active.variants[rawGate] ? rawGate : null;

  const go = (type: string, method: string | null) => {
    const q = new URLSearchParams({ type });
    if (method) q.set("method", method);
    router.replace(`${pathname}?${q}`, { scroll: false });
  };

  return (
    <>
      <PageHeader
        title="Transfers"
        description="Send money between your accounts, to another bank, to a crypto wallet or to friends. Every transfer is checked before it's processed."
        actions={
          <Button asChild variant="secondary" icon={<Users aria-hidden="true" />}>
            <Link href="/beneficiaries">Manage payees</Link>
          </Button>
        }
      />

      {accounts.length === 0 ? (
        <Card>
          <EmptyState
            title="You need an account to make a transfer"
            description="Once you have an active account, you can send money from it here."
            action={
              <Button asChild>
                <Link href="/vaults">Go to Accounts</Link>
              </Button>
            }
          />
        </Card>
      ) : types.length === 0 ? (
        <Card>
          <EmptyState
            title="Transfers aren't available right now"
            description="No transfer methods are currently available for your profile. Contact us if you need to send money."
            action={
              <Button asChild variant="secondary">
                <Link href="/support">Contact support</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <Tabs value={activeId} onValueChange={(v) => go(v, null)}>
          <TabsList aria-label="Where are you sending money?">
            {types.map((t) => {
              const Icon = TYPE_ICONS[t.illustration];
              return (
                <TabsTrigger key={t.id} value={t.id} className="gap-2">
                  <Icon className="size-4" aria-hidden />
                  {t.title}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {types.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-6">
              <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                <Card className="p-5 sm:p-6 lg:col-span-8">
                  {active?.id === t.id && (
                    <TransferFormEngine
                      key={t.id}
                      type={t}
                      gate={gate}
                      onGateChange={(g) => go(t.id, g)}
                      accounts={accounts}
                      limitOverrides={limitOverrides}
                      processingTimes={processingTimes}
                      onSubmitted={() => setRefreshKey((k) => k + 1)}
                    />
                  )}
                </Card>
                <AboutPanel type={t} gate={active?.id === t.id ? gate : null} cfg={cfg} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <div className="mt-8">
        <RecentRequests refreshKey={refreshKey} />
      </div>
    </>
  );
}

function AboutPanel({ type, gate, cfg }: { type: TransferTypeDef; gate: string | null; cfg: Record<string, MethodConfigLite> }) {
  const variant = gate ? type.variants[gate] : null;
  const c = variant ? cfg[variant.methodId] : undefined;

  return (
    <aside aria-label={`About ${type.title}`} className="flex flex-col gap-5 lg:col-span-4">
      <Card variant="muted" className="p-5">
        <h2 className="font-sans text-h5 text-fg">{variant ? variant.label : type.title}</h2>
        <p className="mt-2 text-small text-fg-muted">{type.about.what}</p>
        {variant && (c?.processingTime || c?.perTransferLimit || variant.info.note) && (
          <dl className="mt-4 flex flex-col gap-3 border-t border-line pt-4 text-small">
            {c?.processingTime && (
              <div>
                <dt className="text-fg-muted">Processing time</dt>
                <dd className="text-fg">{c.processingTime}</dd>
              </div>
            )}
            {c?.perTransferLimit ? (
              <div>
                <dt className="text-fg-muted">Most you can send at once</dt>
                <dd className="text-fg tabular-nums">{formatAmount(c.perTransferLimit, { currency: "USD" })}</dd>
              </div>
            ) : null}
            {variant.info.note && (
              <div>
                <dt className="text-fg-muted">Good to know</dt>
                <dd className="text-fg">{variant.info.note}</dd>
              </div>
            )}
          </dl>
        )}
      </Card>
      <Card variant="muted" className="p-5">
        <h2 className="font-sans text-h5 text-fg">How it works</h2>
        <ol className="mt-3 flex flex-col gap-2">
          {type.about.steps.map((s, i) => (
            <li key={s} className="flex items-start gap-3 text-small text-fg">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-round border border-line-strong text-caption font-semibold tabular-nums text-fg-muted">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Card>
    </aside>
  );
}
