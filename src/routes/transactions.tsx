import { createFileRoute } from "@tanstack/react-router";
import { useExpenses } from "@/lib/budget-store";
import { Sidebar } from "@/components/budget/Sidebar";
import { AddExpense } from "@/components/budget/AddExpense";
import { TransactionList } from "@/components/budget/TransactionList";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Entries — Odin's Eye" },
      { name: "description", content: "All recorded accountability entries." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { expenses, add, remove, update } = useExpenses();

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="px-5 md:px-12 pt-8 md:pt-10 pb-6 md:pb-8 border-b border-foreground/20">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Entries
          </div>
          <h2 className="font-serif text-5xl md:text-7xl mt-4 leading-[0.92]">Entries</h2>
          <p className="text-muted-foreground mt-5 max-w-2xl text-base md:text-lg leading-8">
            A focused list of the signals you have recorded.
          </p>
        </header>

        <div className="px-5 md:px-12 py-6 md:py-8 space-y-6 md:space-y-8">
          <AddExpense onAdd={add} />

          <TransactionList
            expenses={expenses}
            onRemove={remove}
            onUpdate={update}
            title="All Entries"
          />
        </div>
      </main>
    </div>
  );
}
