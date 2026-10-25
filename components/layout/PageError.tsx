"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CloudOff, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * The body of every portal error.tsx: says what failed, reassures, and
 * offers a retry and a route to support. Focus moves here so screen-reader
 * users hear it.
 */
export function PageError({
  pageTitle,
  title,
  description = "This is usually temporary. Your money is not affected. Try again, or contact us if it keeps happening.",
  reset,
}: {
  /** The page's name, kept as the h1 for assistive tech. */
  pageTitle: string;
  title: string;
  description?: string;
  reset: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div ref={ref} tabIndex={-1} role="alert" className="focus:outline-none">
      <h1 className="sr-only">{pageTitle}</h1>
      <Card>
        <EmptyState
          icon={CloudOff}
          headingLevel={2}
          title={title}
          description={description}
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
