/**
 * Contribution schedules for savings goals. Dates are calendar days in UTC;
 * the daily job (app/api/cron/savings) handles everything due by its run.
 */

export type Frequency = 'WEEKLY' | 'MONTHLY';
export type ContributionMode = 'NONE' | 'AUTO' | 'MANUAL';

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Monthly plans run on day 1 to 28, so every month has the day. */
export const MAX_MONTH_DAY = 28;

export function isValidScheduleDay(frequency: Frequency, day: number): boolean {
  if (!Number.isInteger(day)) return false;
  return frequency === 'WEEKLY' ? day >= 0 && day <= 6 : day >= 1 && day <= MAX_MONTH_DAY;
}

/** The first scheduled day strictly after `after` (00:00 UTC on that day). */
export function nextContributionDate(frequency: Frequency, day: number, after: Date): Date {
  const start = new Date(Date.UTC(after.getUTCFullYear(), after.getUTCMonth(), after.getUTCDate()));
  if (frequency === 'WEEKLY') {
    const ahead = (day - start.getUTCDay() + 7) % 7 || 7;
    return new Date(start.getTime() + ahead * 86_400_000);
  }
  const thisMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), day));
  return thisMonth > start ? thisMonth : new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, day));
}

/** "Every Monday" / "Monthly on the 15th". */
export function describeSchedule(frequency: Frequency, day: number): string {
  if (frequency === 'WEEKLY') return `Every ${WEEKDAYS[day]}`;
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  return `Monthly on the ${day}${suffix}`;
}
