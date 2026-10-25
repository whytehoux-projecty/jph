import Link from "next/link";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/** 404 for signed-in pages (rendered inside the portal shell). */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="sr-only">Page not found</h1>
      <Card>
        <EmptyState
          icon={SearchX}
          headingLevel={2}
          title="We can't find that page"
          description="It may have moved, or the link may be out of date. Your accounts are not affected."
          action={
            <>
              <Button asChild>
                <Link href="/dashboard">Go to Overview</Link>
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
