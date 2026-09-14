import { useMemo, useState } from "react";
import { Calendar, Clock3, Repeat } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { addDays, addWeeks, addMonths, startOfToday } from "date-fns";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export type ScheduleType = "now" | "once" | "recurring";

export type ScheduleFrequency = "daily" | "weekly" | "biweekly" | "monthly";

export type ScheduleEndType = "never" | "after" | "on";

export interface TransferSchedule {
  type: ScheduleType;
  startDate: string | null;
  frequency: ScheduleFrequency;
  endType: ScheduleEndType;
  endAfterOccurrences: number | null;
  endOnDate: string | null;
}

interface ScheduleTransferProps {
  value: TransferSchedule;
  onChange: (value: TransferSchedule) => void;
}

export function ScheduleTransfer({ value, onChange }: ScheduleTransferProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const setSchedule = (patch: Partial<TransferSchedule>) => {
    onChange({ ...value, ...patch });
  };

  const today = startOfToday();
  const todayIso = today.toISOString().slice(0, 10);

  const formatDate = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  };

  const startDateLabel = useMemo(() => {
    if (!value.startDate) return "Choose date";
    return new Date(value.startDate).toLocaleDateString();
  }, [value.startDate]);

  const endOnDateLabel = useMemo(() => {
    if (!value.endOnDate) return "Choose end date";
    return new Date(value.endOnDate).toLocaleDateString();
  }, [value.endOnDate]);

  const schedulePreview = useMemo(() => {
    if (value.type === "now") return "This transfer will be sent immediately.";
    if (!value.startDate) return "Select a start date to preview schedule.";
    const start = new Date(value.startDate).toLocaleDateString();
    if (value.type === "once") {
      return "This transfer will be sent on " + start + ".";
    }
    let text = "Starting " + start + ", ";
    if (value.frequency === "daily") text += "every day";
    if (value.frequency === "weekly") text += "every week";
    if (value.frequency === "biweekly") text += "every 2 weeks";
    if (value.frequency === "monthly") text += "every month";
    if (value.endType === "after" && value.endAfterOccurrences) {
      text += ", " + value.endAfterOccurrences + " occurrences total.";
    } else if (value.endType === "on" && value.endOnDate) {
      const end = new Date(value.endOnDate).toLocaleDateString();
      text += ", until " + end + ".";
    } else if (value.endType === "never") {
      text += ", with no end date.";
    } else {
      text += ".";
    }
    return text;
  }, [value]);

  const recurringSummary = useMemo(() => {
    if (value.type !== "recurring" || !value.startDate) return null;
    const start = new Date(value.startDate);
    if (Number.isNaN(start.getTime())) return null;

    const firstTransfer = start.toLocaleDateString();
    let frequencyLabel = "";
    if (value.frequency === "daily") frequencyLabel = "Every day";
    if (value.frequency === "weekly") frequencyLabel = "Every week";
    if (value.frequency === "biweekly") frequencyLabel = "Every 2 weeks";
    if (value.frequency === "monthly") frequencyLabel = "Every month";

    let totalText = "No end date";
    let lastTransfer: string | null = null;

    if (value.endType === "after" && value.endAfterOccurrences) {
      const count = value.endAfterOccurrences;
      totalText = count + " transfers";
      const occurrences = Math.max(count - 1, 0);
      let last = start;
      if (value.frequency === "daily") {
        last = addDays(start, occurrences);
      } else if (value.frequency === "weekly") {
        last = addWeeks(start, occurrences);
      } else if (value.frequency === "biweekly") {
        last = addWeeks(start, occurrences * 2);
      } else if (value.frequency === "monthly") {
        last = addMonths(start, occurrences);
      }
      lastTransfer = last.toLocaleDateString();
    } else if (value.endType === "on" && value.endOnDate) {
      const end = new Date(value.endOnDate);
      if (!Number.isNaN(end.getTime())) {
        lastTransfer = end.toLocaleDateString();
        totalText = "Until " + lastTransfer;
      }
    }

    return {
      firstTransfer,
      frequencyLabel,
      totalText,
      lastTransfer,
    };
  }, [value]);

  const scheduleTypeButtonClasses =
    "flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition";

  const pillActive =
    "bg-[color:var(--heritage-navy)] text-white shadow-sm border border-[color:var(--heritage-navy)]";

  const pillInactive =
    "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200";

  const frequencyButtonClasses =
    "px-3 py-1.5 rounded-full text-xs transition border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50";

  return (
    <div className="space-y-4">
      <div className="inline-flex w-full rounded-full bg-slate-100 p-1 text-xs">
        <button
          type="button"
          onClick={() =>
            setSchedule({
              type: "now",
            })
          }
          className={`${scheduleTypeButtonClasses} ${
            value.type === "now" ? pillActive : pillInactive
          } flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50`}>
          <Clock3 className="h-3 w-3" />
          <span>Send now</span>
        </button>
        <button
          type="button"
          onClick={() =>
            setSchedule({
              type: "once",
            })
          }
          className={`${scheduleTypeButtonClasses} ${
            value.type === "once" ? pillActive : pillInactive
          } flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50`}>
          <Calendar className="h-3 w-3" />
          <span>Schedule once</span>
        </button>
        <button
          type="button"
          onClick={() =>
            setSchedule({
              type: "recurring",
            })
          }
          className={`${scheduleTypeButtonClasses} ${
            value.type === "recurring" ? pillActive : pillInactive
          } flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50`}>
          <Repeat className="h-3 w-3" />
          <span>Recurring</span>
        </button>
      </div>

      {value.type !== "now" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Start date</Label>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="small"
                  className="w-full h-9 justify-between px-3 text-xs font-normal"
                  aria-label="Choose start date"
                  aria-expanded={startOpen}>
                  <span>
                    {value.startDate
                      ? formatDate(value.startDate)
                      : "Choose date"}
                  </span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] space-y-3" align="start">
                <div className="text-[11px] text-muted-foreground">
                  Quick picks
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="small"
                    variant="outline"
                    className="h-7 px-3 text-[11px]"
                    onClick={() => {
                      setSchedule({ startDate: todayIso });
                      setStartOpen(false);
                    }}>
                    Today
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="outline"
                    className="h-7 px-3 text-[11px]"
                    onClick={() => {
                      const d = addDays(today, 1).toISOString().slice(0, 10);
                      setSchedule({ startDate: d });
                      setStartOpen(false);
                    }}>
                    Tomorrow
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="outline"
                    className="h-7 px-3 text-[11px]"
                    onClick={() => {
                      const d = addDays(today, 7).toISOString().slice(0, 10);
                      setSchedule({ startDate: d });
                      setStartOpen(false);
                    }}>
                    In 7 days
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="outline"
                    className="h-7 px-3 text-[11px]"
                    onClick={() => {
                      const d = addMonths(today, 1).toISOString().slice(0, 10);
                      setSchedule({ startDate: d });
                      setStartOpen(false);
                    }}>
                    Next month
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px]">Pick exact date</Label>
                  <Input
                    type="date"
                    className="h-9"
                    min={todayIso}
                    value={value.startDate || ""}
                    onChange={(e) =>
                      setSchedule({
                        startDate: e.target.value || null,
                      })
                    }
                  />
                </div>
              </PopoverContent>
            </Popover>
            <p className="text-[11px] text-muted-foreground">
              {startDateLabel}
            </p>
          </div>

          {value.type === "recurring" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Frequency</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "daily", label: "Daily" },
                  { id: "weekly", label: "Weekly" },
                  { id: "biweekly", label: "Every 2 weeks" },
                  { id: "monthly", label: "Monthly" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setSchedule({
                        frequency: option.id as ScheduleFrequency,
                      })
                    }
                    className={`${frequencyButtonClasses} ${
                      value.frequency === option.id
                        ? "border-[color:var(--heritage-navy)] bg-soft-gold/10 text-charcoal"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {value.type === "recurring" && (
        <div className="space-y-2">
          <Label className="text-xs">End</Label>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                setSchedule({
                  endType: "never",
                  endAfterOccurrences: null,
                  endOnDate: null,
                })
              }
              className={`px-3 py-1.5 rounded-full border ${
                value.endType === "never"
                  ? "border-[color:var(--heritage-navy)] bg-soft-gold/10 text-charcoal"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}>
              No end date
            </button>
            <button
              type="button"
              onClick={() =>
                setSchedule({
                  endType: "after",
                  endOnDate: null,
                })
              }
              className={`px-3 py-1.5 rounded-full border ${
                value.endType === "after"
                  ? "border-[color:var(--heritage-navy)] bg-soft-gold/10 text-charcoal"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}>
              After
            </button>
            <button
              type="button"
              onClick={() =>
                setSchedule({
                  endType: "on",
                  endAfterOccurrences: null,
                })
              }
              className={`px-3 py-1.5 rounded-full border ${
                value.endType === "on"
                  ? "border-[color:var(--heritage-navy)] bg-soft-gold/10 text-charcoal"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}>
              On date
            </button>
          </div>

          {value.endType === "after" && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                className="h-9 w-20"
                value={value.endAfterOccurrences ?? ""}
                onChange={(e) =>
                  setSchedule({
                    endAfterOccurrences: e.target.value
                      ? parseInt(e.target.value, 10)
                      : null,
                  })
                }
              />
              <span className="text-xs text-muted-foreground">
                transfers then stop
              </span>
            </div>
          )}

          {value.endType === "on" && (
            <div className="space-y-1.5">
              <Popover open={endOpen} onOpenChange={setEndOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    className="w-full max-w-xs h-9 justify-between px-3 text-xs font-normal"
                    aria-label="Choose end date"
                    aria-expanded={endOpen}>
                    <span>
                      {value.endOnDate
                        ? formatDate(value.endOnDate)
                        : "Choose end date"}
                    </span>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] space-y-3">
                  <div className="text-[11px] text-muted-foreground">
                    Quick picks
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="small"
                      variant="outline"
                      className="h-7 px-3 text-[11px]"
                      onClick={() => {
                        const d = addMonths(today, 3)
                          .toISOString()
                          .slice(0, 10);
                        setSchedule({ endOnDate: d });
                        setEndOpen(false);
                      }}>
                      In 3 months
                    </Button>
                    <Button
                      type="button"
                      size="small"
                      variant="outline"
                      className="h-7 px-3 text-[11px]"
                      onClick={() => {
                        const d = addMonths(today, 6)
                          .toISOString()
                          .slice(0, 10);
                        setSchedule({ endOnDate: d });
                        setEndOpen(false);
                      }}>
                      In 6 months
                    </Button>
                    <Button
                      type="button"
                      size="small"
                      variant="outline"
                      className="h-7 px-3 text-[11px]"
                      onClick={() => {
                        const d = addMonths(today, 12)
                          .toISOString()
                          .slice(0, 10);
                        setSchedule({ endOnDate: d });
                        setEndOpen(false);
                      }}>
                      In 1 year
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Pick exact end date</Label>
                    <Input
                      type="date"
                      className="h-9"
                      min={value.startDate || todayIso}
                      value={value.endOnDate || ""}
                      onChange={(e) =>
                        setSchedule({
                          endOnDate: e.target.value || null,
                        })
                      }
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <p className="text-[11px] text-muted-foreground">
                {endOnDateLabel}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/60 px-3 py-2 text-xs flex gap-2 items-start">
        <Clock3 className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
        <div className="flex-1 space-y-1">
          <p className="text-muted-foreground">{schedulePreview}</p>
          {recurringSummary && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                  First transfer
                </p>
                <p className="text-xs text-charcoal">
                  {recurringSummary.firstTransfer}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                  Frequency
                </p>
                <p className="text-xs text-charcoal">
                  {recurringSummary.frequencyLabel}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                  Total transfers
                </p>
                <p className="text-xs text-charcoal">
                  {recurringSummary.totalText}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                  Last transfer
                </p>
                <p className="text-xs text-charcoal">
                  {recurringSummary.lastTransfer || "Not set"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
