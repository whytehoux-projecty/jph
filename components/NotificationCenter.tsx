'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemData {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

export function NotificationCenter({ onClick }: { onClick?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      if (res) {
        setNotifications(res);
        setUnreadCount(res.filter((n: any) => !n.isRead).length);
      }
    } catch {
      // Unauthenticated or network error
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="small"
          aria-label="Notifications"
          className="text-white hover:bg-white/10 hover:text-white relative transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--heritage-gold)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[color:var(--heritage-gold)] border border-white" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-md shadow-xl border border-[color:var(--heritage-navy)]/20 bg-white text-charcoal z-50"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-[color:var(--heritage-navy)] font-playfair">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              className="text-xs text-[color:var(--heritage-navy)] hover:text-[color:var(--heritage-gold)] font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Bell className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-gray-700">All caught up!</p>
              <p className="text-xs text-gray-400">You have no new alerts at this time.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                className={cn(
                  "p-3.5 flex gap-3 transition-colors cursor-pointer",
                  !n.isRead
                    ? "bg-amber-50/40 hover:bg-amber-50/70 border-l-2 border-[color:var(--heritage-gold)]"
                    : "hover:bg-gray-50/80 border-l-2 border-transparent opacity-80"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {!n.isRead ? (
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <AlertCircle className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-xs font-semibold truncate", !n.isRead ? "text-gray-900" : "text-gray-600")}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
