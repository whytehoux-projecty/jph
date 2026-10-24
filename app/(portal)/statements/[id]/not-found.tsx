import Link from "next/link";
import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/empty-state";

export default function StatementNotFound() {
  return (
    <>
      <h1 className="sr-only">Statement not found</h1>
      <Card>
        <EmptyState
          icon={SearchX}
          headingLevel={2}
          title="We can't find that statement"
          description="It may have been closed, or the link may be out of date."
          action={
            <Button asChild>
              <Link href="/statements">Back to statements</Link>
            </Button>
          }
        />
      </Card>
    </>
  );
}
