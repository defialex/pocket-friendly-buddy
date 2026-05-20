import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useExpenses } from "@/lib/budget-store";
import { Sidebar } from "@/components/budget/Sidebar";
import { StatStrip } from "@/components/budget/StatStrip";
import { AddExpense } from "@/components/budget/AddExpense";
import { CategoryBreakdown } from "@/components/budget/CategoryBreakdown";
import { TransactionList } from "@/components/budget/TransactionList";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Ledger — A quiet budget journal" },
      {
        name: "description",
        content:
          "An editorial-style personal budget app. Track income and expenses by category in a calm, paper-and-ink interface.",
      },
      { property: "og:title", content: "The Ledger — A quiet budget journal" },
      {
        property: "og:description",
        content: "Track income and expenses by category in a calm, editorial interface.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { expenses, add, remove, update } = useExpenses();
  const [monthName, setMonthName] = useState("");

  useEffect(() => {
    setMonthName(
      new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    );
  }, []);

  const recent = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <header className="px-6 md:px-12 pt-10 pb-8 border-b border-foreground/20">
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
                suppressHydrationWarning
              >
                Vol. I · {monthName || "\u00a0"}
              </div>
              <h2 className="font-serif text-5xl md:text-6xl mt-3 leading-none">Dashboard</h2>
              <p className="font-serif italic text-muted-foreground mt-3 max-w-xl">
                A faithful account of income and expenditure, kept as one would keep a diary.
              </p>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">
              <div>folio · 01</div>
              <div className="mt-1">printed daily</div>
            </div>
          </div>
        </header>

        <div className="px-6 md:px-12 py-8 space-y-8">
          <StatStrip expenses={expenses} />
          <AddExpense onAdd={add} />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-8">
            <TransactionList
              expenses={recent}
              onRemove={remove}
              onUpdate={update}
              title="Recent Entries"
            />
            <CategoryBreakdown expenses={expenses} kind="expense" />
          </div>

          <footer className="pt-8 border-t border-foreground/20 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>— end of folio —</span>
            <span>The Ledger · est. 2026</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
