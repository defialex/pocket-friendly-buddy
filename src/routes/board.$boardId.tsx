import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { setCurrentBoardId, useBoards, useExpenses } from "@/lib/budget-store";
import { useEffect } from "react";
import { Sidebar } from "@/components/budget/Sidebar";
import { StatStrip } from "@/components/budget/StatStrip";
import { AddExpense } from "@/components/budget/AddExpense";
import { TransactionList } from "@/components/budget/TransactionList";

export const Route = createFileRoute("/board/$boardId")({
  component: BoardPage,
});

function BoardPage() {
  const { boardId } = Route.useParams();
  const location = useLocation();
  const { boards } = useBoards();
  const { expenses: entries, add, remove, update } = useExpenses(boardId);
  const board = boards.find((item) => item.id === boardId);
  const dashboardName = board?.name ?? boardId;

  useEffect(() => {
    setCurrentBoardId(boardId);
  }, [boardId]);

  if (location.pathname.endsWith("/categories") || location.pathname.endsWith("/reports")) {
    return <Outlet />;
  }

  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />

      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <header className="px-5 sm:px-7 md:px-12 pt-8 sm:pt-10 md:pt-14 pb-7 sm:pb-9 md:pb-10 border-b border-foreground/10">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Your Control Panel
          </div>

          <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl mt-4 leading-[0.92] text-foreground">
            {dashboardName}
          </h2>

          <p className="text-muted-foreground mt-5 max-w-2xl text-base sm:text-lg leading-8">
            Do your Habits match your ambitions?
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/board/$boardId/categories"
              params={{ boardId }}
              className="font-mono text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-foreground/20 bg-card/70 hover:border-foreground/40 transition-colors"
            >
              Manage Categories
            </Link>
            <Link
              to="/board/$boardId/reports"
              params={{ boardId }}
              className="font-mono text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-foreground/20 bg-card/70 hover:border-foreground/40 transition-colors"
            >
              Reports
            </Link>
          </div>
        </header>

        <div className="px-5 sm:px-7 md:px-12 py-6 sm:py-8 md:py-10 space-y-6 sm:space-y-7 md:space-y-9 max-w-7xl">
          <StatStrip expenses={entries} boardId={boardId} />

          <section id="new-entry">
            <AddExpense onAdd={add} boardId={boardId} />
          </section>

          <TransactionList
            expenses={recent}
            onRemove={remove}
            onUpdate={update}
            boardId={boardId}
            title="Recent Entries"
          />
        </div>
      </main>
    </div>
  );
}
