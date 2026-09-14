'use client';

import { useEffect, useState, useCallback } from 'react';
import { Wifi, WifiOff, Construction, Clock } from 'lucide-react';

type PortalStatus = 'online' | 'offline' | 'maintenance' | 'scheduled_downtime';

interface PortalStatusData {
    status: PortalStatus;
    timestamp: string;
    message?: string;
    nextScheduledMaintenance?: string;
}

interface PortalStatusIndicatorProps {
    healthCheckUrl?: string;
    pollInterval?: number; // in milliseconds
    onStatusChange?: (status: PortalStatus) => void;
    showDetails?: boolean;
    className?: string;
}

export function PortalStatusIndicator({
    healthCheckUrl = '/api/portal/health',
    pollInterval = 30000, // Default: check every 30 seconds
    onStatusChange,
    showDetails = true,
    className = '',
}: PortalStatusIndicatorProps) {
    const [statusData, setStatusData] = useState<PortalStatusData | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    const checkPortalHealth = useCallback(async () => {
        try {
            const response = await fetch(healthCheckUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Don't cache health check responses
                cache: 'no-store',
            });

            const data = await response.json();

            if (data.success && data.data) {
                setStatusData(data.data);

                // Notify parent component of status change
                if (onStatusChange && data.data.status) {
                    onStatusChange(data.data.status);
                }
            } else {
                // If API returns unsuccessful, assume offline
                setStatusData({
                    status: 'offline',
                    timestamp: new Date().toISOString(),
                    message: 'Unable to verify portal status',
                });
            }
        } catch {
            // If fetch fails, portal is likely offline
            setStatusData({
                status: 'offline',
                timestamp: new Date().toISOString(),
                message: 'Portal is currently unavailable',
            });
        } finally {
            setIsChecking(false);
        }
    }, [healthCheckUrl, onStatusChange]);

    useEffect(() => {
        // Check immediately on mount
        checkPortalHealth();

        // Set up polling interval
        const intervalId = setInterval(checkPortalHealth, pollInterval);

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, [checkPortalHealth, pollInterval]);

    if (isChecking && !statusData) {
        return (
            <div className={`flex items-center gap-2 p-3 rounded-none border border-gray-200 bg-gray-50 ${className}`}>
                <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse" />
                <div>
                    <p className="text-sm font-semibold text-gray-700">Checking portal status...</p>
                </div>
            </div>
        );
    }

    if (!statusData) {
        return null;
    }

    const getStatusConfig = (status: PortalStatus) => {
        switch (status) {
            case 'online':
                return {
                    color: 'bg-green-500',
                    textColor: 'text-green-700',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    icon: Wifi,
                    label: 'Portal Online',
                    defaultMessage: 'E-Banking portal is operational and ready to use.',
                };
            case 'offline':
                return {
                    color: 'bg-red-500',
                    textColor: 'text-red-700',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    icon: WifiOff,
                    label: 'Portal Offline',
                    defaultMessage: 'E-Banking portal is currently unavailable. Please try again later.',
                };
            case 'maintenance':
                return {
                    color: 'bg-gray-500',
                    textColor: 'text-gray-700',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    icon: Construction,
                    label: 'Under Maintenance',
                    defaultMessage: 'E-Banking portal is undergoing maintenance. Please check back shortly.',
                };
            case 'scheduled_downtime':
                return {
                    color: 'bg-yellow-500',
                    textColor: 'text-yellow-700',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    icon: Clock,
                    label: 'Scheduled Maintenance',
                    defaultMessage: 'E-Banking portal has scheduled maintenance.',
                };
            default:
                return {
                    color: 'bg-gray-500',
                    textColor: 'text-gray-700',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    icon: WifiOff,
                    label: 'Unknown Status',
                    defaultMessage: 'Portal status is unknown.',
                };
        }
    };

    const config = getStatusConfig(statusData.status);
    const StatusIcon = config.icon;

    // Minimal design for offline status
    if (statusData.status === 'offline') {
        return (
            <div className={`flex items-center justify-center gap-3 p-3 rounded-none border border-red-200 bg-red-50 ${className}`}>
                <WifiOff className="w-5 h-5 text-red-600" />
                <p className="text-sm font-semibold text-red-700">OFFLINE</p>
            </div>
        );
    }

    // Minimal design for online status
    if (statusData.status === 'online') {
        return (
            <div className={`flex items-center justify-center gap-3 p-3 rounded-none border border-green-200 bg-green-50 ${className}`}>
                <Wifi className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-green-700">ONLINE</p>
            </div>
        );
    }

    return (
        <div className={`flex items-start gap-3 p-4 rounded-none border ${config.borderColor} ${config.bgColor} ${className}`}>
            {/* Animated status indicator */}
            <div className="relative flex-shrink-0 mt-0.5">
                <div className={`w-3 h-3 rounded-full ${config.color}`} />

            </div>

            <div className="flex-1 min-w-0">
                {/* Status header */}
                <div className="flex items-center gap-2 mb-1">
                    <StatusIcon className={`w-4 h-4 ${config.textColor}`} />
                    <p className={`text-sm font-semibold ${config.textColor}`}>{config.label}</p>
                </div>

                {/* Status message */}
                {showDetails && (
                    <>
                        <p className="text-xs text-gray-600">
                            {statusData.message || config.defaultMessage}
                        </p>

                        {/* Next scheduled maintenance */}
                        {statusData.nextScheduledMaintenance && (
                            <p className="text-xs text-gray-500 mt-2">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Next maintenance: {new Date(statusData.nextScheduledMaintenance).toLocaleString()}
                            </p>
                        )}

                        {/* Last checked timestamp */}
                        <p className="text-xs text-gray-400 mt-1">
                            Last checked: {new Date(statusData.timestamp).toLocaleTimeString()}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

// Compact version for smaller spaces
export function PortalStatusBadge({
    healthCheckUrl = '/api/portal/health',
    pollInterval = 30000,
    className = '',
}: Omit<PortalStatusIndicatorProps, 'showDetails' | 'onStatusChange'>) {
    const [status, setStatus] = useState<PortalStatus>('offline');
    const [isChecking, setIsChecking] = useState(true);

    const checkPortalHealth = useCallback(async () => {
        try {
            const response = await fetch(healthCheckUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });

            const data = await response.json();

            if (data.success && data.data) {
                setStatus(data.data.status);
            } else {
                setStatus('offline');
            }
        } catch {
            setStatus('offline');
        } finally {
            setIsChecking(false);
        }
    }, [healthCheckUrl]);

    useEffect(() => {
        checkPortalHealth();
        const intervalId = setInterval(checkPortalHealth, pollInterval);
        return () => clearInterval(intervalId);
    }, [checkPortalHealth, pollInterval]);

    const getStatusColor = (status: PortalStatus) => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'offline':
                return 'bg-red-500';
            case 'maintenance':
                return 'bg-gray-500';
            case 'scheduled_downtime':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (status: PortalStatus) => {
        switch (status) {
            case 'online':
                return 'Online';
            case 'offline':
                return 'Offline';
            case 'maintenance':
                return 'Maintenance';
            case 'scheduled_downtime':
                return 'Scheduled';
            default:
                return 'Unknown';
        }
    };

    if (isChecking) {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 ${className}`}>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                <span className="text-xs font-medium text-gray-600">Checking...</span>
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 ${className}`}>
            <div className="relative">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                {status === 'online' && (
                    <div className={`absolute inset-0 w-2 h-2 rounded-full ${getStatusColor(status)} animate-ping opacity-75`} />
                )}
            </div>
            <span className="text-xs font-medium text-gray-700">Portal {getStatusText(status)}</span>
        </div>
    );
}
