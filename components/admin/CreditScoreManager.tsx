'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { deleteCreditScore, getCustomerCreditScores, saveCreditScore } from '@/app/actions/admin-customers';

type ScoreRow = { id: string; month: string; score: number; change: number; updatedAt: string };

const thisMonth = () => new Date().toISOString().slice(0, 7);
const monthLabel = (m: string) =>
  new Date(`${m}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });

/**
 * Staff record, correct and delete a customer's credit score, one per month.
 * The change from the previous month is worked out automatically. The latest
 * month is what the customer sees in Savings and loans.
 */
export function CreditScoreManager({ userId }: { userId: string }) {
  const [rows, setRows] = useState<ScoreRow[] | null>(null);
  const [month, setMonth] = useState(thisMonth());
  const [score, setScore] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await getCustomerCreditScores(userId));
    } catch {
      toast.error('Could not load credit scores.');
      setRows([]);
    }
  }, [userId]);

  useEffect(() => {
    setRows(null);
    setScore('');
    setMonth(thisMonth());
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveCreditScore(userId, month, Number(score));
      toast.success(`Score saved for ${monthLabel(month)}`);
      setScore('');
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save the score.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    try {
      await deleteCreditScore(id);
      toast.success('Score deleted');
      setConfirmDelete(null);
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete the score.');
    } finally {
      setBusy(false);
    }
  };

  const existingForMonth = rows?.find((r) => r.month === month);

  return (
    <div className="space-y-4">
      <form onSubmit={save} className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label htmlFor={`cs-month-${userId}`} className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Month</label>
          <input
            id={`cs-month-${userId}`}
            type="month"
            value={month}
            max={thisMonth()}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor={`cs-score-${userId}`} className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Score (300–850)</label>
          <input
            id={`cs-score-${userId}`}
            type="number"
            inputMode="numeric"
            min={300}
            max={850}
            step={1}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
            required
          />
        </div>
        <p className="col-span-2 text-[11px] text-neutral-500">
          {existingForMonth
            ? `${monthLabel(month)} already has ${existingForMonth.score}; saving replaces it.`
            : 'The change from the previous month is calculated for you.'}
        </p>
        <Button type="submit" size="small" disabled={busy || !score} className="col-span-2 w-full bg-(--ink-900) text-white hover:bg-(--ink-900)/90">
          {existingForMonth ? 'Update score' : 'Save score'}
        </Button>
      </form>

      <div>
        <h6 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2">History</h6>
        {rows === null ? (
          <p className="text-xs text-neutral-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-neutral-500">No score recorded. The customer sees no score until you add one.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 border border-neutral-100 rounded-lg">
            {rows.map((r, i) => (
              <li key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                <div>
                  <span className="font-semibold text-ink-900">{r.score}</span>
                  <span className={`ml-2 text-xs ${r.change > 0 ? 'text-emerald-700' : r.change < 0 ? 'text-rose-700' : 'text-neutral-500'}`}>
                    {i === rows.length - 1 ? 'first' : r.change > 0 ? `+${r.change}` : r.change}
                  </span>
                  <span className="block text-[11px] text-neutral-500">{monthLabel(r.month)}{i === 0 && ' · shown to customer'}</span>
                </div>
                {confirmDelete === r.id ? (
                  <div className="flex items-center gap-1">
                    <Button type="button" size="small" variant="outline" disabled={busy} onClick={() => setConfirmDelete(null)} className="h-7 px-2 text-xs">
                      Keep
                    </Button>
                    <Button type="button" size="small" disabled={busy} onClick={() => remove(r.id)} className="h-7 px-2 text-xs bg-rose-600 hover:bg-rose-700 text-white">
                      Delete
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${monthLabel(r.month)}`}
                      onClick={() => {
                        setMonth(r.month);
                        setScore(String(r.score));
                      }}
                      className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${monthLabel(r.month)}`}
                      onClick={() => setConfirmDelete(r.id)}
                      className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
