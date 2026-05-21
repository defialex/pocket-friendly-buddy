import { useState } from "react";
import {
  formatMoney,
  useCategories,
  colorForCategory,
  type Expense,
} from "@/lib/budget-store";
import { EditTransactionDialog } from "./EditTransactionDialog";

export function TransactionList({
  expenses,
  onRemove,
  onUpdate,
  title = "Recent Entries",
}: {
  expenses: Expense[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Omit<Expense, "id">>) => void;
  title?: string;
}) {
  const { categories } = useCategories();
  const [editing, setEditing] = useState<Expense | null>(null);
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="border border-foreground/20 bg-card p-5 md:p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-serif text-xl">{title}</h3>
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
          {sorted.map((e) => {
            const isIncome = e.kind === "income";
            const color = colorForCategory(categories, e.category, e.kind);
            return (
              <li
                key={e.id}
                className="flex items-start gap-3 py-3 group"
              >
                <span
                  aria-hidden
                  className="mt-2 inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-serif text-base truncate">{e.note}</div>
                    <span className="font-mono text-base tabular-nums whitespace-nowrap">
                      {isIncome ? "+" : "−"}
                      {formatMoney(e.amount)}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5 flex items-center justify-between gap-2 flex-wrap">
                    <span className="truncate">
                      {e.category}
                      <span className="ml-2">
                        · {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                      </span>
                    </span>
                    <span className="flex items-center gap-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing(e)}
                        aria-label="Edit entry"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => onRemove(e.id)}
                        aria-label="Remove entry"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <EditTransactionDialog
        expense={editing}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          if (editing) onUpdate(editing.id, patch);
          setEditing(null);
        }}
      />
    </section>
  );
}
