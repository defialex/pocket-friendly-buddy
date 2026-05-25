import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  formatValue,
  labelForMeasurementType,
  setCurrentBoardId,
  useBoards,
  useCategories,
  useExpenses,
  type CategoryDef,
  type Expense,
} from "@/lib/budget-store";
import { Sidebar } from "@/components/budget/Sidebar";

export const Route = createFileRoute("/board/$boardId/reports")({
  component: BoardReportsPage,
});

type PeriodMode = "weekly" | "monthly";

function BoardReportsPage() {
  const { boardId } = Route.useParams();
  const { boards } = useBoards();
  const { expenses: entries } = useExpenses(boardId);
  const { categories } = useCategories(boardId);
  const [mode, setMode] = useState<PeriodMode>("weekly");
  const [periodDate, setPeriodDate] = useState(() => startOfDay(new Date()));
  const board = boards.find((item) => item.id === boardId);
  const dashboardName = board?.name ?? boardId;

  useEffect(() => {
    setCurrentBoardId(boardId);
  }, [boardId]);

  const period = useMemo(() => getPeriod(periodDate, mode), [mode, periodDate]);
  const rows = useMemo(
    () => buildCategoryRows(categories, entries, period.start, period.end, mode),
    [categories, entries, mode, period.end, period.start],
  );

  const shiftPeriod = (direction: -1 | 1) => {
    setPeriodDate((current) => {
      const next = new Date(current);

      if (mode === "weekly") {
        next.setDate(next.getDate() + direction * 7);
      } else {
        next.setMonth(next.getMonth() + direction);
      }

      return startOfDay(next);
    });
  };

  const switchMode = (nextMode: PeriodMode) => {
    setMode(nextMode);
    setPeriodDate((current) => startOfDay(current));
  };

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <header className="px-5 md:px-12 pt-8 md:pt-14 pb-7 md:pb-10 border-b border-foreground/10">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Period Reports
          </div>

          <h2 className="font-serif text-5xl md:text-7xl mt-4 leading-[0.92]">{dashboardName}</h2>

          <p className="text-muted-foreground mt-5 max-w-2xl text-base md:text-lg leading-8">
            Review each category against the rhythm you meant to keep, week by week or month by
            month.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/board/$boardId"
              params={{ boardId }}
              className="font-mono text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-foreground/20 bg-card/70 hover:border-foreground/40 transition-colors"
            >
              Open Dashboard
            </Link>
            <Link
              to="/board/$boardId/categories"
              params={{ boardId }}
              className="font-mono text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-foreground/20 bg-card/70 hover:border-foreground/40 transition-colors"
            >
              Manage Categories
            </Link>
          </div>
        </header>

        <div className="px-5 md:px-12 py-6 md:py-8 space-y-6 md:space-y-8">
          <section className="border border-foreground/10 bg-card p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Selected Period
                </div>
                <h3 className="font-serif text-3xl md:text-4xl mt-2">{period.label}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex border border-foreground/15 bg-secondary/30 p-1">
                  {(["weekly", "monthly"] as PeriodMode[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => switchMode(item)}
                      className={`h-10 px-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                        mode === item
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item === "weekly" ? "Weekly" : "Monthly"}
                    </button>
                  ))}
                </div>

                <div className="inline-flex border border-foreground/15 bg-secondary/30">
                  <button
                    type="button"
                    onClick={() => shiftPeriod(-1)}
                    className="h-12 px-4 border-r border-foreground/10 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftPeriod(1)}
                    className="h-12 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="border border-foreground/10 bg-card">
            <div className="hidden md:grid grid-cols-[1.25fr_0.9fr_1fr_1fr] gap-5 px-6 md:px-10 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground bg-secondary/35">
              <div>Category</div>
              <div>Type</div>
              <div>Total</div>
              <div>Goal</div>
            </div>

            <div className="divide-y divide-foreground/10">
              {rows.map((row) => (
                <ReportRow key={row.category.id} row={row} />
              ))}

              {rows.length === 0 && (
                <div className="px-6 md:px-10 py-8 font-serif italic text-muted-foreground">
                  No categories yet. Create your first category to begin tracking.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ReportRow({ row }: { row: CategoryReportRow }) {
  const safeProgress = Math.max(0, Math.min(row.progress ?? 0, 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.9fr_1fr_1fr] gap-5 px-6 md:px-10 py-6 items-center">
      <div className="flex items-center gap-4 min-w-0">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ background: row.category.color }}
        />

        <div className="min-w-0">
          <div className="font-serif text-2xl truncate text-foreground">{row.category.name}</div>
          <div className="md:hidden mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {labelForMeasurementType(row.category.measurementType)}
          </div>
        </div>
      </div>

      <div className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {labelForMeasurementType(row.category.measurementType)}
      </div>

      <div>
        <div className="md:hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Total
        </div>
        <div className="font-sans text-3xl font-semibold tracking-normal">
          {formatValue(row.total, row.category.measurementType)}
        </div>
      </div>

      <div>
        <div className="md:hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Goal
        </div>

        {row.goal ? (
          <div>
            <div className="flex justify-between gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>{formatValue(row.goal, row.category.measurementType)}</span>
              <span>{Math.round(row.progress ?? 0)}%</span>
            </div>

            <div
              className="mt-2 h-2 rounded-full overflow-hidden"
              style={{ background: `${row.category.color}1f` }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${safeProgress}%`,
                  background: `linear-gradient(90deg, ${row.category.color}, color-mix(in oklch, ${row.category.color} 55%, var(--ink-deep)))`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            No goal set
          </div>
        )}
      </div>
    </div>
  );
}

type CategoryReportRow = {
  category: CategoryDef;
  total: number;
  goal?: number;
  progress?: number;
};

function buildCategoryRows(
  categories: CategoryDef[],
  entries: Expense[],
  start: Date,
  end: Date,
  mode: PeriodMode,
): CategoryReportRow[] {
  return categories.map((category) => {
    const total = entries
      .filter((entry) => entry.category === category.name && isEntryInPeriod(entry, start, end))
      .reduce((sum, entry) => sum + (entry.value ?? 0), 0);
    const goal = mode === "weekly" ? category.weeklyGoal : category.monthlyGoal;

    return {
      category,
      total,
      goal,
      progress: goal ? (total / goal) * 100 : undefined,
    };
  });
}

function isEntryInPeriod(entry: Expense, start: Date, end: Date) {
  const date = parseEntryDate(entry.date);

  return date >= start && date < end;
}

function getPeriod(date: Date, mode: PeriodMode) {
  if (mode === "weekly") {
    const start = startOfWeek(date);
    const end = addDays(start, 7);
    const labelEnd = addDays(end, -1);

    return {
      start,
      end,
      label: formatWeeklyLabel(start, labelEnd),
    };
  }

  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return {
    start,
    end,
    label: start.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  };
}

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + diff);

  return start;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);

  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

function parseEntryDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return startOfDay(new Date(date));
  }

  return new Date(year, month - 1, day);
}

function formatWeeklyLabel(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameMonth && sameYear) {
    return `${start.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })} – ${end.toLocaleDateString("en-US", {
      day: "numeric",
      year: "numeric",
    })}`;
  }

  if (sameYear) {
    return `${start.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })} – ${end.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  return `${start.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })} – ${end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;
}
