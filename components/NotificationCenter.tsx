'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, RotateCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { cn } from '@/lib/utils';

interface NotificationItemData {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

type LoadState = 'loading' | 'ready' | 'error';

/** Bell button with the customer's notifications (app/actions/notifications). */
export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    setState('loading');
    try {
      const res = await getNotifications();
      setNotifications(res ?? []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await markAsRead(id);
    } catch {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } finally {
      setMarkingAll(false);
    }
  };

  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        aria-label={label}
        className="relative flex size-11 items-center justify-center rounded-control text-fg transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
      >
        <Bell className="size-5" strokeWidth={1.75} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-round bg-danger px-1 text-caption font-semibold leading-5 text-fg-on-action tabular-nums"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="font-sans text-h5 text-fg">Notifications</h2>
          {unreadCount > 0 && (
            <Button variant="tertiary" size="sm" onClick={handleMarkAllAsRead} loading={markingAll} icon={<CheckCheck aria-hidden="true" />}>
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto" aria-busy={state === 'loading'}>
          {state === 'loading' && (
            <div className="flex flex-col gap-4 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3.5 w-full" />
                </div>
              ))}
            </div>
          )}

          {state === 'error' && (
            <EmptyState
              compact
              title="Notifications didn't load"
              description="Check your connection and try again."
              action={
                <Button variant="secondary" size="sm" onClick={fetchNotifications} icon={<RotateCw aria-hidden="true" />}>
                  Try again
                </Button>
              }
            />
          )}

          {state === 'ready' && notifications.length === 0 && (
            <EmptyState
              compact
              icon={Bell}
              title="No notifications"
              description="Messages about your accounts and payments will appear here."
            />
          )}

          {state === 'ready' && notifications.length > 0 && (
            <ul className="divide-y divide-line">
              {notifications.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                    className={cn(
                      'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                      n.isRead ? 'cursor-default' : 'bg-action-subtle/40',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn('mt-1.5 size-2 shrink-0 rounded-round', n.isRead ? 'bg-transparent' : 'bg-action')}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn('truncate text-small text-fg', !n.isRead && 'font-semibold')}>
                          {n.title}
                        </span>
                        <span className="shrink-0 text-caption text-fg-muted">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-small text-fg-muted">{n.message}</span>
                      {!n.isRead && <span className="sr-only">Unread. Select to mark as read.</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-line px-4 py-2">
          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="inline-flex min-h-11 items-center text-small font-semibold text-fg-action underline-offset-[3px] hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
