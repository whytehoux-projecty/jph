import Link from "next/link";
import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ReceiptNotFound() {
  return (
    <>
      <h1 className="sr-only">Receipt not found</h1>
      <Card>
        <EmptyState
          icon={SearchX}
          headingLevel={2}
          title="We can't find that transaction"
          description="It may have been closed, or the link may be out of date."
          action={
            <Button asChild>
              <Link href="/activities">Back to activity</Link>
            </Button>
          }
        />
      </Card>
    </>
  );
}
