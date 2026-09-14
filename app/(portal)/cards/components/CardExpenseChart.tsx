"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/skeleton"
import { getTransactionStats } from "@/app/actions/transactions";
import { cn } from "@/lib/utils"

const EMPTY_WEEK = [
    { name: "Mon", total: 0 },
    { name: "Tue", total: 0 },
    { name: "Wed", total: 0 },
    { name: "Thu", total: 0 },
    { name: "Fri", total: 0 },
    { name: "Sat", total: 0 },
    { name: "Sun", total: 0 },
]

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function mapWeekStats(statsData: any): { name: string; total: number }[] {
    if (statsData?.daily && Array.isArray(statsData.daily)) {
        return statsData.daily.slice(-7).map((d: any) => ({
            name: DAY_NAMES[new Date(d.date).getDay()],
            total: Math.abs(Number(d.amount ?? d.total ?? 0)),
        }));
    }
    if (statsData?.expenses !== undefined) {
        const total = Math.abs(Number(statsData.expenses ?? 0));
        const avg = total / 7;
        return EMPTY_WEEK.map(d => ({ ...d, total: Math.round(avg) }));
    }
    return EMPTY_WEEK;
}

function mapMonthStats(statsData: any): { name: string; total: number }[] {
    // Build last-6-months bar from whatever is available
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return { name: MONTH_LABELS[d.getMonth()], total: 0 };
    });
}

type Period = "week" | "month";

export function CardExpenseChart() {
    const [period, setPeriod] = useState<Period>("week");
    const [weekData, setWeekData] = useState(EMPTY_WEEK);
    const [monthData, setMonthData] = useState<{ name: string; total: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [weekTotal, setWeekTotal] = useState(0);
    const [monthTotal, setMonthTotal] = useState(0);

    const now = new Date();
    const monthLabel = now.toLocaleDateString("en-US", { month: "long" });
    const year = now.getFullYear();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getTransactionStats("week"),
            getTransactionStats("month"),
        ])
            .then(([weekStats, monthStats]) => {
                const mapped = mapWeekStats(weekStats);
                setWeekData(mapped);
                const wTotal = mapped.reduce((s, d) => s + d.total, 0);
                setWeekTotal(wTotal);

                const mMapped = mapMonthStats(monthStats);
                // Fill last bar with current month's spend
                const mTotal = Math.abs(Number((monthStats as any)?.expenses ?? 0));
                if (mMapped.length > 0) {
                    mMapped[mMapped.length - 1].total = Math.round(mTotal);
                }
                setMonthData(mMapped);
                setMonthTotal(mTotal);
            })
            .catch(() => {
                setHasError(true);
                setWeekData(EMPTY_WEEK);
                setMonthData(mapMonthStats(null));
            })
            .finally(() => setLoading(false));
    }, []);

    const data = period === "week" ? weekData : monthData;
    const total = period === "week" ? weekTotal : monthTotal;
    const title = period === "week"
        ? `This Week · ${monthLabel} ${year}`
        : `Last 6 Months · ${year}`;

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-medium">{title}</CardTitle>
                        {!loading && (
                            <p className="text-2xl font-bold font-mono text-charcoal mt-1">
                                ${total.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                <span className="text-sm font-normal text-muted-foreground ml-1.5">spent</span>
                            </p>
                        )}
                    </div>
                    {/* Period Switcher */}
                    <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1">
                        {(["week", "month"] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={cn(
                                    "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                    period === p
                                        ? "bg-white shadow-sm text-charcoal"
                                        : "text-muted-foreground hover:text-charcoal"
                                )}
                            >
                                {p === "week" ? "Weekly" : "Monthly"}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-[180px] w-full flex items-end justify-between gap-2 px-2 pb-4">
                        {[60, 40, 80, 55, 90, 70, 45].map((h, i) => (
                            <Skeleton key={i} className="w-full" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} barCategoryGap="30%">
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 4 }}
                                        formatter={(v: number) => [`$${v.toLocaleString()}`, "Spent"]}
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                                            fontSize: "12px",
                                        }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="currentColor"
                                        radius={[5, 5, 0, 0]}
                                        className="fill-vintage-green/80"
                                        barSize={period === "week" ? 32 : 24}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {hasError && (
                            <p className="text-[11px] text-muted-foreground text-center mt-1">
                                Could not load spending data
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
