import type { WBSTask } from "./types";

export type ScheduledTask = WBSTask & {
  start: number;
  end: number;
  depth: number;
};

export type Schedule = {
  tasks: ScheduledTask[];
  byId: Record<string, ScheduledTask>;
  totalDays: number;
  criticalPath: string[];
  startDate: Date;
};

/**
 * CPM-style forward pass over the WBS. "depth" is derived from id structure
 * ("1", "1.1", "1.1.1"…) so the UI can indent the tree correctly.
 */
export function computeSchedule(tasks: WBSTask[], start = new Date()): Schedule {
  const byId: Record<string, ScheduledTask> = {};

  const sorted = [...tasks].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  for (const t of sorted) {
    const deps = t.dependsOn ?? [];
    let earliestStart = 0;
    for (const dep of deps) {
      const depTask = byId[dep];
      if (depTask) earliestStart = Math.max(earliestStart, depTask.end);
    }
    byId[t.id] = {
      ...t,
      start: earliestStart,
      end: earliestStart + t.durationDays,
      depth: Math.max(0, t.id.split(".").length - 1),
    };
  }

  const all = Object.values(byId);
  const totalDays = all.reduce((m, t) => Math.max(m, t.end), 0);

  const criticalSet = new Set<string>();
  for (const t of all) {
    if (t.critical) criticalSet.add(t.id);
  }
  const criticalPath = [...criticalSet].sort((a, b) => byId[a].start - byId[b].start);

  return { tasks: all, byId, totalDays, criticalPath, startDate: start };
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function formatDay(n: number, start: Date): string {
  const d = addDays(start, n);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
