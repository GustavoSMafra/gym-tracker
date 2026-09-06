import type { WorkoutSession } from './types';

// Weeks run Monday-Sunday.
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameWeek(a: Date, b: Date): boolean {
  return startOfWeek(a).getTime() === startOfWeek(b).getTime();
}

export function sessionsThisWeek(sessions: WorkoutSession[], now: Date = new Date()): WorkoutSession[] {
  return sessions.filter((s) => isSameWeek(new Date(s.date), now));
}

export function sessionsThisMonth(sessions: WorkoutSession[], now: Date = new Date()): WorkoutSession[] {
  return sessions.filter((s) => {
    const d = new Date(s.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
}

// Consecutive weeks (including the current one) with at least one session.
export function currentStreakWeeks(sessions: WorkoutSession[], now: Date = new Date()): number {
  if (sessions.length === 0) return 0;

  const weekStarts = new Set(sessions.map((s) => startOfWeek(new Date(s.date)).getTime()));
  let streak = 0;
  let cursor = startOfWeek(now);

  while (weekStarts.has(cursor.getTime())) {
    streak += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 7);
  }

  return streak;
}

export function lastPerformedDate(workoutId: string, sessions: WorkoutSession[]): string | undefined {
  const matches = sessions
    .filter((s) => s.workoutId === workoutId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return matches[0]?.date;
}

// The workout least recently performed (or never performed) is suggested first.
export function suggestWorkoutId(
  workoutIds: string[],
  sessions: WorkoutSession[]
): string | undefined {
  if (workoutIds.length === 0) return undefined;

  return [...workoutIds].sort((a, b) => {
    const lastA = lastPerformedDate(a, sessions) ?? '';
    const lastB = lastPerformedDate(b, sessions) ?? '';
    return lastA.localeCompare(lastB);
  })[0];
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export interface MonthGroup {
  monthKey: string; // "2026-09"
  label: string; // "September 2026"
  sessions: WorkoutSession[];
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function sessionsGroupedByMonth(sessions: WorkoutSession[]): MonthGroup[] {
  const groups = new Map<string, WorkoutSession[]>();
  for (const session of sessions) {
    const key = monthKey(new Date(session.date));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(session);
  }

  return Array.from(groups.entries())
    .map(([key, groupSessions]) => ({
      monthKey: key,
      label: monthLabel(key),
      sessions: [...groupSessions].sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}

// Coarse duration for stats, e.g. "1h 20m" or "45m".
export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`;
}

// Live clock readout for a running session, e.g. "05:32" or "1:05:32".
export function formatElapsedClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
