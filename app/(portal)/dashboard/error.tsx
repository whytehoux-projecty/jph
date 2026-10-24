"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CloudOff, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/empty-state";

/** Shown when the dashboard's data can't be loaded. Nothing is guessed. */
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div ref={ref} tabIndex={-1} role="alert" className="focus:outline-none">
      <h1 className="sr-only">Overview</h1>
      <Card>
        <EmptyState
          icon={CloudOff}
          headingLevel={2}
          title="We couldn't load your accounts"
          description="This is usually temporary. Your money is not affected. Try again, or contact us if it keeps happening."
          action={
            <>
              <Button onClick={reset} icon={<RotateCw aria-hidden="true" />}>
                Try again
              </Button>
              <Button asChild variant="secondary">
                <Link href="/support">Contact support</Link>
              </Button>
            </>
          }
        />
      </Card>
    </div>
  );
}
