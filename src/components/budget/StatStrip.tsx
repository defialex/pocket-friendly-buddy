import { formatMoney, type Expense } from "@/lib/budget-store";

export function StatStrip({ expenses }: { expenses: Expense[] }) {
  const now = new Date();
  const month = now.toISOString().slice(0, 7);
  const thisMonth = expenses.filter((e) => e.date.startsWith(month));
  const total = thisMonth.reduce((s, e) => s + e.amount, 0);
  const count = thisMonth.length;
  const avg = count ? total / count : 0;

  const today = now.toISOString().slice(0, 10);
  const todayTotal = expenses.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);

  const stats = [
    { label: "Spent this month", value: formatMoney(total), accent: true },
    { label: "Entries", value: String(count) },
    { label: "Avg. per entry", value: formatMoney(avg) },
    { label: "Today", value: formatMoney(todayTotal) },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 border border-foreground/20 bg-card divide-x divide-foreground/15">
      {stats.map((s, i) => (
        <div key={i} className="p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {s.label}
          </div>
          <div
            className={`mt-3 tabular-nums ${
              s.accent ? "font-serif text-4xl" : "font-mono text-2xl"
            }`}
          >
            {s.value}
          </div>
        </div>
      ))}
    </section>
  );
}
