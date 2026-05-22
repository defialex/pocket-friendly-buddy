import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  setCurrentBoardId,
  useBoards,
  useCategories,
  useExpenses,
  COLOR_PALETTE,
  type CategoryDef,
  type MeasurementType,
  labelForMeasurementType,
} from "@/lib/budget-store";
import { Sidebar } from "@/components/budget/Sidebar";

export const Route = createFileRoute("/board/$boardId/categories")({
  component: BoardCategoriesPage,
});

function BoardCategoriesPage() {
  const { boardId } = Route.useParams();
  const { boards } = useBoards();
  const { categories, add, remove, updateCategory } = useCategories(boardId);
  const { expenses } = useExpenses(boardId);
  const board = boards.find((item) => item.id === boardId);
  const dashboardName = board?.name ?? boardId;

  useEffect(() => {
    setCurrentBoardId(boardId);
  }, [boardId]);

  const usageCount = (category: CategoryDef) =>
    expenses.filter((entry) => entry.category === category.name).length;

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <header className="px-5 md:px-12 pt-8 md:pt-14 pb-7 md:pb-10 border-b border-foreground/10">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Category System
          </div>

          <h2 className="font-serif text-5xl md:text-7xl mt-4 leading-[0.92]">{dashboardName}</h2>

          <p className="text-muted-foreground mt-5 max-w-2xl text-base md:text-lg leading-8">
            Shape the measurements that define this dashboard. Keep them simple, clear, and worth
            repeating.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/board/$boardId"
              params={{ boardId }}
              className="font-mono text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-foreground/20 bg-card/70 hover:border-foreground/40 transition-colors"
            >
              Open Dashboard
            </Link>
          </div>
        </header>

        <div className="px-5 md:px-12 py-6 md:py-8">
          <CategoryCreator onAdd={add} />

          <section className="mt-6 border border-foreground/10 bg-card p-5 md:p-6">
            <h3 className="font-serif text-2xl mb-4">{dashboardName} Categories</h3>
            <div className="rule mb-5" />

            <ul className="divide-y divide-foreground/10">
              {categories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  usage={usageCount(category)}
                  onUpdate={updateCategory}
                  onRemove={() => {
                    if (confirm(`Remove "${category.name}"?`)) {
                      remove(category.id);
                    }
                  }}
                />
              ))}

              {categories.length === 0 && (
                <li className="font-serif italic text-muted-foreground py-6">
                  No categories yet. Create one above.
                </li>
              )}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

function CategoryCreator({
  onAdd,
}: {
  onAdd: (
    name: string,
    measurementType: MeasurementType,
    color?: string,
    weeklyGoal?: number,
    monthlyGoal?: number,
  ) => void;
}) {
  const [name, setName] = useState("");
  const [measurementType, setMeasurementType] = useState<MeasurementType>("hours");
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const controlClass =
    "h-12 rounded-full bg-secondary/40 border border-foreground/10 focus:border-foreground/30 outline-none px-5 leading-none shadow-none";
  const compactControlClass =
    "h-12 rounded-full bg-secondary/40 border border-foreground/10 focus:border-foreground/30 outline-none px-5 font-mono text-xs leading-none shadow-none";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) return;

    onAdd(
      cleanName,
      measurementType,
      color,
      weeklyGoal ? Number(weeklyGoal) : undefined,
      monthlyGoal ? Number(monthlyGoal) : undefined,
    );

    setName("");
    setWeeklyGoal("");
    setMonthlyGoal("");
  };

  return (
    <form
      onSubmit={submit}
      className="border border-foreground/10 bg-card p-5 md:p-6 grid grid-cols-1 md:grid-cols-[1fr_140px_120px_120px_120px_auto] gap-4 md:items-end"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Work, Sport, Learning…"
        className={`${controlClass} font-serif text-base`}
      />

      <select
        value={measurementType}
        onChange={(e) => setMeasurementType(e.target.value as MeasurementType)}
        className={`${compactControlClass} appearance-none uppercase tracking-wider`}
      >
        <option value="hours">Hours</option>
        <option value="times">Times</option>
        <option value="euro">Euro</option>
      </select>

      <input
        type="number"
        value={weeklyGoal}
        onChange={(e) => setWeeklyGoal(e.target.value)}
        placeholder="Week goal"
        className={`${compactControlClass} appearance-none`}
      />

      <input
        type="number"
        value={monthlyGoal}
        onChange={(e) => setMonthlyGoal(e.target.value)}
        placeholder="Month goal"
        className={`${compactControlClass} appearance-none`}
      />

      <select
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className={`${compactControlClass} appearance-none`}
      >
        {COLOR_PALETTE.map((paletteColor) => (
          <option key={paletteColor} value={paletteColor}>
            {paletteColor}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="h-12 rounded-full inline-flex items-center justify-center font-mono text-xs uppercase tracking-[0.2em] px-6 bg-foreground text-background hover:bg-foreground/85 transition-colors"
      >
        Add
      </button>
    </form>
  );
}

function CategoryRow({
  category,
  usage,
  onUpdate,
  onRemove,
}: {
  category: CategoryDef;
  usage: number;
  onUpdate: (id: string, patch: Partial<Omit<CategoryDef, "id">>) => void;
  onRemove: () => void;
}) {
  const weeklyGoal = category.weeklyGoal ?? "";
  const monthlyGoal = category.monthlyGoal ?? "";
  const rowControlClass =
    "h-12 rounded-full bg-secondary/30 border border-foreground/10 focus:border-foreground/30 outline-none px-5 leading-none shadow-none";
  const compactRowControlClass =
    "h-12 rounded-full bg-secondary/30 border border-foreground/10 focus:border-foreground/30 outline-none px-5 font-mono text-xs leading-none shadow-none";

  return (
    <li className="py-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_130px_120px_120px_120px_auto] gap-4 items-end">
        <input
          value={category.name}
          onChange={(e) => onUpdate(category.id, { name: e.target.value })}
          className={`${rowControlClass} font-serif text-base`}
        />

        <select
          value={category.measurementType}
          onChange={(e) =>
            onUpdate(category.id, {
              measurementType: e.target.value as MeasurementType,
            })
          }
          className={`${compactRowControlClass} appearance-none uppercase tracking-wider`}
        >
          <option value="hours">Hours</option>
          <option value="times">Times</option>
          <option value="euro">Euro</option>
        </select>

        <input
          type="number"
          value={weeklyGoal}
          onChange={(e) =>
            onUpdate(category.id, {
              weeklyGoal: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Week"
          className={`${compactRowControlClass} appearance-none`}
        />

        <input
          type="number"
          value={monthlyGoal}
          onChange={(e) =>
            onUpdate(category.id, {
              monthlyGoal: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Month"
          className={`${compactRowControlClass} appearance-none`}
        />

        <select
          value={category.color}
          onChange={(e) => onUpdate(category.id, { color: e.target.value })}
          className={`${compactRowControlClass} appearance-none`}
        >
          {COLOR_PALETTE.map((paletteColor) => (
            <option key={paletteColor} value={paletteColor}>
              {paletteColor}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRemove}
          className="h-12 w-12 rounded-full border border-foreground/10 bg-secondary/30 font-mono text-base text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {labelForMeasurementType(category.measurementType)} · {usage}{" "}
        {usage === 1 ? "entry" : "entries"}
      </div>
    </li>
  );
}
