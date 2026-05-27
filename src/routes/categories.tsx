import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useCategories,
  useExpenses,
  COLOR_PALETTE,
  type CategoryDef,
  type MeasurementType,
  labelForMeasurementType,
} from "@/lib/budget-store";
import { Sidebar } from "@/components/budget/Sidebar";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, add, remove, updateCategory } = useCategories();
  const { expenses } = useExpenses();

  const usageCount = (category: CategoryDef) =>
    expenses.filter((entry) => entry.category === category.name).length;

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="px-5 md:px-12 pt-8 md:pt-10 pb-6 md:pb-8 border-b border-foreground/20">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Category System
          </div>
          <h2 className="font-serif text-4xl md:text-6xl mt-3 leading-none">Categories</h2>
          <p className="font-serif italic text-muted-foreground mt-3 max-w-xl">
            Create, edit, and measure what matters.
          </p>
        </header>

        <div className="px-5 md:px-12 py-6 md:py-8">
          <CategoryCreator onAdd={add} />

          <section className="mt-6 border border-foreground/20 bg-card p-5 md:p-6">
            <h3 className="font-serif text-xl mb-4">Your Categories</h3>
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
      className="border border-foreground/20 bg-card p-5 md:p-6 grid grid-cols-1 md:grid-cols-[1fr_140px_120px_120px_120px_auto] gap-4 md:items-end"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Work, Sport, Learning…"
        className="bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-serif italic text-base py-2"
      />

      <select
        value={measurementType}
        onChange={(e) => setMeasurementType(e.target.value as MeasurementType)}
        className="bg-transparent border-b border-foreground/30 outline-none font-mono text-xs uppercase tracking-wider py-2"
      >
        <option value="hours">Hours</option>
        <option value="times">Times</option>
        <option value="euro">Euro</option>
        <option value="km">Kilometres / km</option>
      </select>

      <input
        type="number"
        value={weeklyGoal}
        onChange={(e) => setWeeklyGoal(e.target.value)}
        placeholder="Week goal"
        className="bg-transparent border-b border-foreground/30 outline-none font-mono text-xs py-2"
      />

      <input
        type="number"
        value={monthlyGoal}
        onChange={(e) => setMonthlyGoal(e.target.value)}
        placeholder="Month goal"
        className="bg-transparent border-b border-foreground/30 outline-none font-mono text-xs py-2"
      />

      <select
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="bg-transparent border-b border-foreground/30 outline-none font-mono text-xs py-2"
      >
        {COLOR_PALETTE.map((paletteColor) => (
          <option key={paletteColor} value={paletteColor}>
            {paletteColor}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="font-mono text-xs uppercase tracking-[0.2em] px-5 py-3 bg-foreground text-background"
      >
        Add →
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

  return (
    <li className="py-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_130px_120px_120px_120px_auto] gap-4 items-end">
        <input
          value={category.name}
          onChange={(e) => onUpdate(category.id, { name: e.target.value })}
          className="bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-serif text-base py-2"
        />

        <select
          value={category.measurementType}
          onChange={(e) =>
            onUpdate(category.id, {
              measurementType: e.target.value as MeasurementType,
            })
          }
          className="bg-transparent border-b border-foreground/30 outline-none font-mono text-xs uppercase tracking-wider py-2"
        >
          <option value="hours">Hours</option>
          <option value="times">Times</option>
          <option value="euro">Euro</option>
          <option value="km">Kilometres / km</option>
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
          className="bg-transparent border-b border-foreground/30 outline-none font-mono text-xs py-2"
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
          className="bg-transparent border-b border-foreground/30 outline-none font-mono text-xs py-2"
        />

        <select
          value={category.color}
          onChange={(e) => onUpdate(category.id, { color: e.target.value })}
          className="bg-transparent border-b border-foreground/30 outline-none font-mono text-xs py-2"
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
          className="font-mono text-base text-muted-foreground hover:text-destructive p-1"
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
