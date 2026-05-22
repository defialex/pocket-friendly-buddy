import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useCategories, useExpenses, formatValue, type Expense } from "@/lib/budget-store";
import { Sidebar } from "@/components/budget/Sidebar";
import { CategoryBreakdown } from "@/components/budget/CategoryBreakdown";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Odin's Eye" },
      {
        name: "description",
        content: "Monthly accountability and consistency reports.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { expenses } = useExpenses();
  const { categories } = useCategories();

  const monthly = useMemo(() => buildMonthly(expenses), [expenses]);
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);

  const summary = [
    { label: "Total entries", value: String(expenses.length) },
    { label: "Categories", value: String(categories.length) },
    {
      label: "This month",
      value: String(expenses.filter((e) => e.date.startsWith(currentMonth)).length),
    },
    {
      label: "This week",
      value: String(expenses.filter((e) => new Date(e.date) >= startOfWeek).length),
    },
  ];

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="px-5 md:px-12 pt-8 md:pt-14 pb-7 md:pb-10 border-b border-foreground/10">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Pattern Review
          </div>
          <h2 className="font-serif text-5xl md:text-7xl mt-4 leading-[0.92]">Reports</h2>
          <p className="text-muted-foreground mt-5 max-w-2xl text-base md:text-lg leading-8">
            A panoramic view of the work, learning, sport, and commitments you have recorded.
          </p>
        </header>

        <div className="px-5 md:px-12 py-6 md:py-8 space-y-6 md:space-y-8">
          <section className="grid grid-cols-2 md:grid-cols-4 border border-foreground/10 bg-card divide-x divide-foreground/10">
            {summary.map((s) => (
              <div key={s.label} className="p-6">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-3 font-serif text-3xl tabular-nums">{s.value}</div>
              </div>
            ))}
          </section>

          <section className="border border-foreground/10 bg-card p-6">
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="font-serif text-xl">Recorded Activity · Last 6 Months</h3>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                monthly
              </span>
            </div>
            <div className="rule mb-5" />
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <BarChart data={monthly} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="var(--ink-deep)" strokeOpacity={0.08} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--ink)" }}
                    axisLine={{ stroke: "var(--ink-deep)", strokeOpacity: 0.2 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--ink)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => String(v)}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--ink-deep)", fillOpacity: 0.04 }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--ink-deep)",
                      borderRadius: 0,
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                    }}
                    formatter={(v: number, name: string) => [
                      name === "Entries" ? String(v) : formatValue(v),
                      name,
                    ]}
                  />
                  <Bar dataKey="entries" fill="var(--ink-deep)" name="Entries" />
                  <Bar dataKey="value" fill="var(--ink)" fillOpacity={0.45} name="Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <CategoryBreakdown expenses={expenses} />
          </div>
        </div>
      </main>
    </div>
  );
}

function buildMonthly(expenses: Expense[]) {
  const now = new Date();
  const months: { key: string; label: string; entries: number; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    months.push({ key, label, entries: 0, value: 0 });
  }
  for (const e of expenses) {
    const m = months.find((x) => e.date.startsWith(x.key));
    if (!m) continue;
    m.entries += 1;
    m.value += e.value;
  }
  return months.map((m) => ({
    ...m,
    value: Math.round(m.value * 100) / 100,
  }));
}
