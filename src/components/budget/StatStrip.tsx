import { formatMoney, type Expense } from "@/lib/budget-store";

export function StatStrip({ expenses }: { expenses: Expense[] }) {
  const now = new Date();
  const month = now.toISOString().slice(0, 7);
  const thisMonth = expenses.filter((e) => e.date.startsWith(month));
  const income = thisMonth.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
  const spent = thisMonth.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
  const net = income - spent;

  const stats = [
    { label: "Income · month", value: formatMoney(income) },
    { label: "Spent · month", value: formatMoney(spent), accent: true },
    { label: "Net", value: (net >= 0 ? "+" : "−") + formatMoney(Math.abs(net)) },
    { label: "Entries", value: String(thisMonth.length) },
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
