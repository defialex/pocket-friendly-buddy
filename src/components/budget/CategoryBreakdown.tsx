import {
  formatMoney,
  useCategories,
  type Expense,
  type TxKind,
} from "@/lib/budget-store";

export function CategoryBreakdown({
  expenses,
  kind = "expense",
}: {
  expenses: Expense[];
  kind?: TxKind;
}) {
  const { categories } = useCategories();
  const cats = categories.filter((c) => c.kind === kind);
  const filtered = expenses.filter((e) => e.kind === kind);

  const totals = cats
    .map((c) => ({
      category: c.name,
      color: c.color,
      total: filtered
        .filter((e) => e.category === c.name)
        .reduce((s, e) => s + e.amount, 0),
    }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);

  const max = Math.max(...totals.map((t) => t.total), 1);
  const grand = totals.reduce((s, t) => s + t.total, 0);

  return (
    <section className="border border-foreground/20 bg-card p-5 md:p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-serif text-xl">
          {kind === "income" ? "Income by Source" : "Spending by Category"}
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {kind}
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
                <div className="flex items-baseline justify-between mb-1.5 gap-3">
                  <span className="font-serif text-sm flex items-center gap-2 min-w-0">
                    <span
                      aria-hidden
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: t.color }}
                    />
                    <span className="truncate">{t.category}</span>
                  </span>
                  <span className="font-mono text-sm tabular-nums whitespace-nowrap">
                    {formatMoney(t.total)}
                    <span className="text-muted-foreground text-[10px] ml-2">{share}%</span>
                  </span>
                </div>
                <div className="h-px bg-foreground/10 relative">
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                    style={{ width: `${pct}%`, height: "5px", background: t.color }}
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
