import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useExpenses, type TxKind } from "@/lib/budget-store";
import { Sidebar } from "@/components/budget/Sidebar";
import { AddExpense } from "@/components/budget/AddExpense";
import { TransactionList } from "@/components/budget/TransactionList";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — The Ledger" },
      { name: "description", content: "All recorded income and expense entries." },
    ],
  }),
  component: TransactionsPage,
});

type Filter = "all" | TxKind;

function TransactionsPage() {
  const { expenses, add, remove, update } = useExpenses();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? expenses : expenses.filter((e) => e.kind === filter)),
    [expenses, filter],
  );

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="px-6 md:px-12 pt-10 pb-8 border-b border-foreground/20">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Vol. II · Register
          </div>
          <h2 className="font-serif text-5xl md:text-6xl mt-3 leading-none">Transactions</h2>
          <p className="font-serif italic text-muted-foreground mt-3 max-w-xl">
            Every entry, line by line. Hover to edit or strike through.
          </p>
        </header>

        <div className="px-6 md:px-12 py-8 space-y-8">
          <AddExpense onAdd={add} />

          <div className="flex items-baseline gap-1 border border-foreground/30 w-fit">
            {(["all", "expense", "income"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-mono text-[10px] uppercase tracking-widest px-4 py-2 transition-colors ${
                  filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <TransactionList
            expenses={filtered}
            onRemove={remove}
            onUpdate={update}
            title="All Entries"
          />
        </div>
      </main>
    </div>
  );
}
