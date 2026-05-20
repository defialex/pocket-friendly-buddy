import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useExpenses, formatMoney, type Expense } from "@/lib/budget-store";
import { Sidebar } from "@/components/budget/Sidebar";
import { CategoryBreakdown } from "@/components/budget/CategoryBreakdown";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — The Ledger" },
      {
        name: "description",
        content: "Monthly income, spending, and net savings reports.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { expenses } = useExpenses();

  const monthly = useMemo(() => buildMonthly(expenses), [expenses]);
  const totalIncome = expenses.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
  const totalSpent = expenses.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
  const net = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0;

  const summary = [
    { label: "Total income", value: formatMoney(totalIncome) },
    { label: "Total spent", value: formatMoney(totalSpent) },
    { label: "Net", value: (net >= 0 ? "+" : "−") + formatMoney(Math.abs(net)) },
    { label: "Savings rate", value: `${savingsRate}%` },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="px-6 md:px-12 pt-10 pb-8 border-b border-foreground/20">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Vol. III · Almanack
          </div>
          <h2 className="font-serif text-5xl md:text-6xl mt-3 leading-none">Reports</h2>
          <p className="font-serif italic text-muted-foreground mt-3 max-w-xl">
            A panoramic view of money as it comes and goes through the months.
          </p>
        </header>

        <div className="px-6 md:px-12 py-8 space-y-8">
          <section className="grid grid-cols-2 md:grid-cols-4 border border-foreground/20 bg-card divide-x divide-foreground/15">
            {summary.map((s) => (
              <div key={s.label} className="p-6">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-3 font-serif text-3xl tabular-nums">{s.value}</div>
              </div>
            ))}
          </section>

          <section className="border border-foreground/20 bg-card p-6">
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="font-serif text-xl">Income vs. Expense · Last 6 Months</h3>
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
                    tickFormatter={(v) => `$${v}`}
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
                    formatter={(v: number, name: string) => [formatMoney(v), name]}
                  />
                  <Bar dataKey="income" fill="var(--ink-deep)" name="Income" />
                  <Bar dataKey="expense" fill="var(--ink)" fillOpacity={0.45} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <CategoryBreakdown expenses={expenses} kind="expense" />
            <CategoryBreakdown expenses={expenses} kind="income" />
          </div>
        </div>
      </main>
    </div>
  );
}

function buildMonthly(expenses: Expense[]) {
  const now = new Date();
  const months: { key: string; label: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    months.push({ key, label, income: 0, expense: 0 });
  }
  for (const e of expenses) {
    const m = months.find((x) => e.date.startsWith(x.key));
    if (!m) continue;
    if (e.kind === "income") m.income += e.amount;
    else m.expense += e.amount;
  }
  return months.map((m) => ({
    ...m,
    income: Math.round(m.income * 100) / 100,
    expense: Math.round(m.expense * 100) / 100,
  }));
}
