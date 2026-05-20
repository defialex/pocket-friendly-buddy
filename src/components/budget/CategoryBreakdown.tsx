import { CATEGORIES, formatMoney, type Expense } from "@/lib/budget-store";

export function CategoryBreakdown({ expenses }: { expenses: Expense[] }) {
  const totals = CATEGORIES.map((c) => ({
    category: c,
    total: expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);

  const max = Math.max(...totals.map((t) => t.total), 1);
  const grand = totals.reduce((s, t) => s + t.total, 0);

  return (
    <section className="border border-foreground/20 bg-card p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-serif text-xl">By Category</h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          this month
        </span>
      </div>
      <div className="rule mb-5" />

      {totals.length === 0 ? (
        <p className="font-serif italic text-muted-foreground text-sm">No entries yet.</p>
      ) : (
        <ul className="space-y-4">
          {totals.map((t) => {
            const pct = (t.total / max) * 100;
            const share = grand ? Math.round((t.total / grand) * 100) : 0;
            return (
              <li key={t.category}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-serif text-sm">{t.category}</span>
                  <span className="font-mono text-sm tabular-nums">
                    {formatMoney(t.total)}
                    <span className="text-muted-foreground text-[10px] ml-2">{share}%</span>
                  </span>
                </div>
                <div className="h-px bg-foreground/10 relative">
                  <div
                    className="absolute inset-y-[-2px] left-0 bg-foreground"
                    style={{ width: `${pct}%`, height: "5px" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
