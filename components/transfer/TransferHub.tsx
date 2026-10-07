"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectorCard } from "@/components/ui/SelectorCard";
import { TRANSFER_TYPES, type TransferTypeDef } from "@/lib/transfer-forms/schema";
import { fmtMoney } from "@/lib/transfer-forms/validators";
import { ART, ICONS } from "./illustrations";
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

interface Props {
  accounts: PortalAccount[];
  methodConfigs: MethodConfigLite[];
}

export function TransferHub({ accounts, methodConfigs }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const cfg = React.useMemo(() => {
    const m: Record<string, MethodConfigLite> = {};
    methodConfigs.forEach((c) => (m[c.methodId] = c));
    return m;
  }, [methodConfigs]);

  // Admin-controlled availability: hide variants that are disabled / hidden / blocked.
  const types: TransferTypeDef[] = React.useMemo(() => {
    const available = (methodId: string) => {
      const c = cfg[methodId];
      return !c || (c.isEnabled && c.isVisibleToUser && !c.isBlockedByAdmin);
    };
    return TRANSFER_TYPES.map((t) => {
      const variants = Object.fromEntries(
        Object.entries(t.variants).filter(([, v]) => available(v.methodId)),
      );
      return {
        ...t,
        variants,
        gate: { ...t.gate, options: t.gate.options.filter((o) => variants[o.value]) },
      };
    }).filter((t) => Object.keys(t.variants).length > 0);
  }, [cfg]);

  const limitOverrides = React.useMemo(() => {
    const o: Record<string, number> = {};
    methodConfigs.forEach((c) => {
      if (c.perTransferLimit) o[c.methodId] = c.perTransferLimit;
    });
    return o;
  }, [methodConfigs]);

  const activeId = params.get("type") || types[0]?.id;
  const active = types.find((t) => t.id === activeId) ?? null;
  const rawGate = params.get("method");
  const gate = active && rawGate && active.variants[rawGate] ? rawGate : null;

  const go = (type: string | null, method: string | null, mode: "push" | "replace") => {
    const q = new URLSearchParams();
    if (type) q.set("type", type);
    if (method) q.set("method", method);
    const url = q.toString() ? `${pathname}?${q}` : pathname;
    router[mode](url, { scroll: false });
  };

  const toggle = (id: string) => go(id === activeId ? null : id, null, "push");

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = types.length - 1;
    let next = -1;
    if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next >= 0) {
      e.preventDefault();
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header className="space-y-3">
        <Link
          href="/transfer"
          className="inline-flex items-center gap-1 text-small text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
        >
          <ChevronLeft className="h-4 w-4" /> Transfers & Pay Bills
        </Link>
        <h1 className="font-display text-h2 font-bold text-ink-900">Transfers</h1>
        <p className="max-w-2xl text-body text-ink-700">
          Choose how you want to send money. Every request is reviewed and approved before it is processed.
        </p>
      </header>

      <div className="flex flex-col">
        <div
          role="tablist"
        aria-label="Transfer types"
        className="flex items-end gap-1 overflow-x-auto scrollbar-hide border-b border-paper-300"
      >
        {types.map((t, i) => {
          const Icon = ICONS[t.illustration];
          const selected = t.id === activeId;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`tab-${t.id}`}
              role="tab"
              aria-controls="transfer-panel"
              aria-expanded={selected}
              className={cn(
                "shrink-0 px-5 py-2.5 rounded-t-md text-[13px] transition-all duration-150 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600 focus-visible:ring-offset-1 flex items-center gap-2 -mb-[1px]",
                selected
                  ? "bg-white text-ink-900 border border-paper-300 border-b-white font-semibold"
                  : "text-ink-500 hover:text-ink-900 hover:bg-paper-100 border border-transparent border-b-transparent"
              )}
              onClick={() => toggle(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <Icon className={cn("h-4 w-4", selected ? "text-ink-900" : "text-ink-500")} />
              {t.title}
            </button>
          );
        })}
      </div>

      <div id="transfer-panel" role="tabpanel" aria-labelledby={active ? `tab-${active.id}` : undefined}>
        <AnimatePresence initial={false} mode="wait">
          {active && (
            <motion.div
              key={active.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="grid overflow-hidden rounded-b-md border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm">
                <div className="p-5 sm:p-8">
                  <TransferFormEngine
                    key={active.id}
                    type={active}
                    gate={gate}
                    onGateChange={(g) => go(active.id, g, "replace")}
                    accounts={accounts}
                    limitOverrides={limitOverrides}
                    onSubmitted={() => setRefreshKey((k) => k + 1)}
                  />
                </div>
                <InfoPanel type={active} gate={gate} cfg={cfg} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      <RecentRequests refreshKey={refreshKey} />
    </div>
  );
}

function InfoPanel({
  type,
  gate,
  cfg,
}: {
  type: TransferTypeDef;
  gate: string | null;
  cfg: Record<string, MethodConfigLite>;
}) {
  const Art = ART[type.illustration];
  const variant = gate ? type.variants[gate] : null;
  const c = variant ? cfg[variant.methodId] : undefined;
  const processing = c?.processingTime || variant?.info.processing;
  const limits = c?.perTransferLimit ? `Up to ${fmtMoney(c.perTransferLimit)} per transfer` : variant?.info.limits;

  return (
    <aside
      aria-label={`About ${type.title}`}
      className="space-y-5 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-br-md"
    >
      <Art className="h-auto w-full rounded" />
      <div className="space-y-2">
        <h2 className="font-display text-base font-semibold text-ink-900">{type.title}</h2>
        <p className="text-small text-ink-700">{type.about.what}</p>
        <p className="text-small text-ink-700">{type.about.how}</p>
      </div>



      <ol className="space-y-2.5" aria-label="How it works">
        {type.about.steps.map((s, i) => (
          <li key={s} className="flex items-start gap-3 text-small text-ink-700">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-paper-50">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </aside>
  );
}
