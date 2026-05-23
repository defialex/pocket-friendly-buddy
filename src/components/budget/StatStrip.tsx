import { useEffect, useState } from "react";
import {
  DEFAULT_BOARD_ID,
  formatValue,
  measurementTypeForCategory,
  useCategories,
  type Expense,
} from "@/lib/budget-store";

export function StatStrip({
  expenses,
  boardId = DEFAULT_BOARD_ID,
}: {
  expenses: Expense[];
  boardId?: string;
}) {
  const { categories } = useCategories(boardId);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);

  const weekEntries = expenses.filter((entry) => {
    const d = new Date(entry.date);
    return d >= startOfWeek;
  });

  const monthEntries = expenses.filter((entry) => entry.date.startsWith(currentMonth));

  const grouped = categories.map((category) => {
    const weekTotal = weekEntries
      .filter((entry) => entry.category === category.name)
      .reduce((sum, entry) => sum + (entry.value ?? 0), 0);

    const monthTotal = monthEntries
      .filter((entry) => entry.category === category.name)
      .reduce((sum, entry) => sum + (entry.value ?? 0), 0);

    const measurementType = measurementTypeForCategory(categories, category.name);

    const weeklyProgress = category.weeklyGoal
      ? Math.min((weekTotal / category.weeklyGoal) * 100, 100)
      : undefined;

    const monthlyProgress = category.monthlyGoal
      ? Math.min((monthTotal / category.monthlyGoal) * 100, 100)
      : undefined;

    return {
      ...category,
      measurementType,
      weekTotal,
      monthTotal,
      weeklyProgress,
      monthlyProgress,
    };
  });

  return (
    <section className="md:border md:border-foreground/10 md:bg-card md:overflow-hidden">
      <div className="space-y-4 md:space-y-0 md:divide-y md:divide-foreground/10">
        <div className="hidden md:grid grid-cols-[1.3fr_1fr_1fr] px-6 md:px-10 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground bg-secondary/35">
          <div>Category</div>
          <div>This Week</div>
          <div>This Month</div>
        </div>

        {grouped.map((category, index) => (
          <div
            key={category.id}
            className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-5 px-6 md:px-10 py-6 items-center border border-foreground/10 bg-card md:border-0 md:bg-transparent"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: category.color }}
              />

              <div className="min-w-0">
                <div className="font-serif text-2xl truncate text-foreground">{category.name}</div>

                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {category.measurementType}
                </div>
              </div>
            </div>

            <ProgressCell
              label="This Week"
              value={category.weekTotal}
              goal={category.weeklyGoal}
              progress={category.weeklyProgress}
              measurementType={category.measurementType}
              accentColor={category.color}
              delayMs={Math.min(index * 90, 360)}
            />

            <ProgressCell
              label="This Month"
              value={category.monthTotal}
              goal={category.monthlyGoal}
              progress={category.monthlyProgress}
              measurementType={category.measurementType}
              accentColor={category.color}
              delayMs={Math.min(index * 90 + 45, 405)}
            />
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="px-6 md:px-10 py-8 font-serif italic text-muted-foreground">
            No categories yet. Create your first category to begin tracking.
          </div>
        )}
      </div>
    </section>
  );
}

function ProgressCell({
  label,
  value,
  goal,
  progress,
  measurementType,
  accentColor,
  delayMs = 0,
}: {
  label: string;
  value: number;
  goal?: number;
  progress?: number;
  measurementType: "hours" | "times" | "euro";
  accentColor: string;
  delayMs?: number;
}) {
  const [ready, setReady] = useState(false);
  const safeProgress = Math.max(0, Math.min(progress ?? 0, 100));
  const isComplete = safeProgress >= 100;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div>
      <div className="md:hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </div>

      <div className="font-sans text-3xl font-semibold tracking-normal">
        {formatValue(value, measurementType)}
      </div>

      {goal ? (
        <div className="mt-3">
          <div className="flex justify-between gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Goal {formatValue(goal, measurementType)}</span>
            <span>{Math.round(progress ?? 0)}%</span>
          </div>

          <div
            className="mt-2 h-2 rounded-full overflow-hidden"
            style={{ background: `${accentColor}1f` }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${ready ? safeProgress : 0}%`,
                background: `linear-gradient(90deg, ${accentColor}, color-mix(in oklch, ${accentColor} 55%, var(--ink-deep)))`,
                boxShadow: isComplete ? `0 0 18px ${accentColor}42` : `0 0 0 ${accentColor}00`,
                transitionDelay: `${delayMs}ms`,
                transitionDuration: "900ms",
                transitionProperty: "width, box-shadow",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          No goal set
        </div>
      )}
    </div>
  );
}
