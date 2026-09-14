'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'; // Ensure this path is correct based on list_dir
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNotifications } from "@/app/actions/notifications";
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    title: string;
    message: string;
    date: string;
    read: boolean;
}

export function NotificationCenter({ onClick }: { onClick?: () => void }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const hasNetworkError = useRef(false);

    const fetchNotifications = async () => {
        if (hasNetworkError.current) {
            return;
        }
        try {
            const res = await getNotifications();
            if (res) {
                // Count unread notifications
                const unread = res.filter((n: any) => !n.isRead).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            hasNetworkError.current = true;
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <Button
            variant="ghost"
            size="small"
            onClick={onClick}
            className="text-white hover:bg-white/10 hover:text-white relative transition-colors"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[color:var(--heritage-gold)] rounded-full border-2 border-transparent"></span>
            )}
        </Button>
    );
}
