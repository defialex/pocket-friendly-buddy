import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  setCurrentBoardId,
  sortEntriesNewestFirst,
  useBoards,
  useExpenses,
} from "@/lib/budget-store";
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

  const recent = [...entries].sort(sortEntriesNewestFirst).slice(0, 8);

  const actionClass =
    "inline-flex min-h-8 shrink items-center justify-center whitespace-nowrap border px-2 py-1.5 text-center font-mono text-[8px] uppercase tracking-[0.12em] transition-colors sm:min-h-9 sm:px-3.5 sm:py-2 sm:text-[9px] sm:tracking-[0.18em]";
  const primaryActionClass = `${actionClass} border-foreground bg-foreground text-background hover:bg-foreground/85`;
  const secondaryActionClass = `${actionClass} border-foreground/20 bg-card/70 text-foreground hover:border-foreground/40`;

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
        </header>

        <nav
          aria-label="Board actions"
          className="border-b border-foreground/10 px-4 py-3 sm:px-7 md:px-12"
        >
          <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2.5">
            <a href="#new-entry" className={primaryActionClass}>
              Record Entry
            </a>
            <Link
              to="/board/$boardId/reports"
              params={{ boardId }}
              className={secondaryActionClass}
            >
              Reports
            </Link>
            <Link
              to="/board/$boardId/categories"
              params={{ boardId }}
              className={secondaryActionClass}
            >
              Manage Categories
            </Link>
          </div>
        </nav>

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
