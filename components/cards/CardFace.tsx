import { Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Flat card visual: ink face, or the card art staff uploaded for this card.
 * Decorative — every detail on it is also listed as text next to it.
 */
export function CardFace({
  last4,
  expiry,
  network,
  type,
  tier,
  holderName,
  imageUrl,
  frozen,
  className,
}: {
  last4: string;
  expiry: string;
  network: string;
  type: string;
  tier?: string | null;
  holderName: string;
  imageUrl?: string | null;
  frozen?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative aspect-[1.586] w-full max-w-sm overflow-hidden rounded-surface bg-surface-inverse p-5 text-fg-inverse",
        className,
      )}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logos/heritage-trust-logo-reversed.svg" alt="" className="h-4 w-auto" />
          <span className="text-caption font-semibold uppercase tracking-wide">
            {type}
            {tier && tier !== "Standard" ? ` · ${tier}` : ""}
          </span>
        </div>
        <p className="font-sans text-h3 tracking-[0.18em] tabular-nums">•••• •••• •••• {last4}</p>
        <div className="flex items-end justify-between gap-3 text-caption">
          <div className="min-w-0">
            <p className="truncate font-semibold uppercase tracking-wide">{holderName}</p>
            <p className="text-fg-inverse-muted tabular-nums">Expires {expiry}</p>
          </div>
          <span className="font-semibold uppercase tracking-wide">{network}</span>
        </div>
      </div>
      {frozen && (
        <div className="absolute inset-0 flex items-center justify-center bg-scrim">
          <span className="flex items-center gap-2 rounded-control bg-surface px-3 py-1.5 text-small font-semibold text-fg">
            <Snowflake className="size-4 text-info" />
            Frozen
          </span>
        </div>
      )}
    </div>
  );
}
