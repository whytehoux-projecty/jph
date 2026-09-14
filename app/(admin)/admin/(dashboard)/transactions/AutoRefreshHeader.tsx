'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw } from 'lucide-react';

export function AutoRefreshHeader() {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pending & Processed Transactions</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Auto-refreshing every 30s · Last updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
        </p>
      </div>
      <button
        onClick={handleManualRefresh}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  );
}
