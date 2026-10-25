"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { markAllAsRead, markAsRead } from "@/app/actions/notifications";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";
import { cn } from "@/lib/utils";

export interface NotificationView {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  when: string;
}

const PAGE_SIZE = 20;

export default function NotificationsClient({ initial }: { initial: NotificationView[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const unread = items.filter((n) => !n.isRead).length;
  const visible = useMemo(() => (filter === "unread" ? items.filter((n) => !n.isRead) : items), [items, filter]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const read = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await markAsRead(id);
      router.refresh();
    } catch (err) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
      toast.error({ title: "We couldn't update that notification", description: userFacingError(err, "Please try again.") });
    }
  };

  const readAll = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success({ title: "All notifications marked as read" });
      router.refresh();
    } catch (err) {
      toast.error({ title: "We couldn't update your notifications", description: userFacingError(err, "Please try again.") });
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Messages about your accounts, payments and requests."
        actions={
          unread > 0 ? (
            <Button variant="secondary" icon={<CheckCheck aria-hidden="true" />} onClick={readAll} loading={markingAll} loadingLabel="Marking all as read">
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <Card>
          <EmptyState icon={Bell} title="No notifications" description="When there's news about your accounts, payments or requests, you'll find it here." />
        </Card>
      ) : (
        <>
          <Tabs
            value={filter}
            onValueChange={(v) => {
              setFilter(v as "all" | "unread");
              setPage(1);
            }}
            className="mb-4"
          >
            <TabsList aria-label="Show notifications">
              <TabsTrigger value="all">All ({items.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unread})</TabsTrigger>
            </TabsList>
          </Tabs>

          {pageItems.length === 0 ? (
            <Card>
              <EmptyState compact icon={CheckCheck} title="You're all caught up" description="You've read every notification." />
            </Card>
          ) : (
            <Card>
              <ul className="divide-y divide-line">
                {pageItems.map((n) => (
                  <li key={n.id} className={cn("flex gap-4 px-5 py-4", !n.isRead && "bg-action-subtle/40")}>
                    <span aria-hidden="true" className={cn("mt-2 size-2 shrink-0 rounded-round", n.isRead ? "bg-transparent" : "bg-action")} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <h2 className={cn("font-sans text-body text-fg", !n.isRead && "font-semibold")}>
                          {!n.isRead && <span className="sr-only">Unread: </span>}
                          {n.title}
                        </h2>
                        <time dateTime={n.createdAt} className="shrink-0 text-caption text-fg-muted">
                          {n.when}
                        </time>
                      </div>
                      <p className="mt-1 text-small text-fg-muted">{n.message}</p>
                      {!n.isRead && (
                        <Button variant="link" size="sm" className="mt-1" onClick={() => read(n.id)}>
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {visible.length > PAGE_SIZE && (
            <Pagination className="mt-6" page={page} pageCount={pageCount} onPageChange={setPage} label="Notification pages" />
          )}
        </>
      )}
    </>
  );
}
