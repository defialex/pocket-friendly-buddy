import { formatMoney, type Expense } from "@/lib/budget-store";

export function TransactionList({
  expenses,
  onRemove,
}: {
  expenses: Expense[];
  onRemove: (id: string) => void;
}) {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="border border-foreground/20 bg-card p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-serif text-xl">Recent Entries</h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {sorted.length} recorded
        </span>
      </div>
      <div className="rule mb-2" />

      {sorted.length === 0 ? (
        <p className="font-serif italic text-muted-foreground text-sm py-6">
          The page is blank. Record your first entry above.
        </p>
      ) : (
        <ul className="divide-y divide-foreground/10">
          {sorted.map((e) => (
            <li key={e.id} className="grid grid-cols-[80px_1fr_auto_auto] items-baseline gap-4 py-3 group">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground tabular-nums">
                {new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "2-digit" })}
              </span>
              <div className="min-w-0">
                <div className="font-serif text-base truncate">{e.note}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                  {e.category}
                </div>
              </div>
              <span className="font-mono text-base tabular-nums">{formatMoney(e.amount)}</span>
              <button
                onClick={() => onRemove(e.id)}
                aria-label="Remove entry"
                className="font-mono text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
