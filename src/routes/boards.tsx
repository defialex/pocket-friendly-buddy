import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { setCurrentBoardId, useBoards, type Board } from "@/lib/budget-store";
import { Sidebar } from "@/components/budget/Sidebar";

export const Route = createFileRoute("/boards")({
  component: BoardsPage,
});

function BoardsPage() {
  const { boards, add, updateBoard } = useBoards();
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) return;

    const board = await add(cleanName);
    setCurrentBoardId(board.id);
    setName("");
    await navigate({
      to: "/board/$boardId",
      params: { boardId: board.id },
    });
  };

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <header className="px-5 md:px-12 pt-8 md:pt-14 pb-7 md:pb-10 border-b border-foreground/10">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Odin's Eye
          </div>

          <h2 className="font-serif text-5xl md:text-7xl mt-4 leading-[0.92]">All Dashboards</h2>

          <p className="text-muted-foreground mt-5 max-w-2xl text-base md:text-lg leading-8">
            Choose the dashboard you want to focus on.
          </p>
        </header>

        <div className="px-5 md:px-12 py-6 md:py-10 space-y-6 max-w-7xl">
          <section className="border border-foreground/10 bg-card emotional-surface p-5 md:p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-serif text-xl">Dashboards</h3>

              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {boards.length} total
              </span>
            </div>

            <div className="rule mb-5" />

            <div className="grid gap-4">
              {boards.map((board) => (
                <DashboardNameRow
                  key={board.id}
                  board={board}
                  onRename={(name) => updateBoard(board.id, { name })}
                />
              ))}

              {boards.length === 0 && (
                <p className="font-serif italic text-muted-foreground">No dashboards yet.</p>
              )}
            </div>
          </section>

          <form
            onSubmit={submit}
            className="border border-foreground/10 bg-card p-5 md:p-6 flex flex-col sm:flex-row gap-4 sm:items-end"
          >
            <label className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                New dashboard
              </div>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Max, Sarah, Team..."
                className="w-full bg-secondary/40 border border-foreground/10 focus:border-foreground/30 outline-none font-serif text-xl px-4 py-3"
              />
            </label>

            <button
              type="submit"
              className="font-mono text-xs uppercase tracking-[0.2em] px-6 py-4 bg-foreground text-background hover:bg-foreground/85 transition-colors"
            >
              Create
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function DashboardNameRow({ board, onRename }: { board: Board; onRename: (name: string) => void }) {
  const [name, setName] = useState(board.name);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setName(board.name);
  }, [board.name]);

  const save = () => {
    const cleanName = name.trim();

    if (!cleanName) {
      setName(board.name);
      return;
    }

    if (cleanName !== board.name) {
      onRename(cleanName);
    }

    setEditing(false);
  };

  return (
    <div className="border border-foreground/10 bg-background/55 rounded-3xl px-5 md:px-6 py-5 hover:border-[color:var(--accent)] hover:bg-accent/20 transition-colors">
      <div className="flex items-center gap-4">
        {editing ? (
          <input
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }

              if (e.key === "Escape") {
                setName(board.name);
                setEditing(false);
              }
            }}
            aria-label={`Edit ${board.name} dashboard name`}
            className="min-w-0 flex-1 bg-transparent outline-none font-serif text-4xl leading-none text-foreground"
          />
        ) : (
          <Link
            to="/board/$boardId"
            params={{ boardId: board.id }}
            className="min-w-0 flex-1 font-serif text-4xl leading-none text-foreground truncate"
            onClick={() => setCurrentBoardId(board.id)}
          >
            {board.name}
          </Link>
        )}

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
