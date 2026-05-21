import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useCategories,
  useExpenses,
  COLOR_PALETTE,
  type CategoryDef,
  type TxKind,
} from "@/lib/budget-store";
import { Sidebar } from "@/components/budget/Sidebar";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — The Ledger" },
      { name: "description", content: "Rename and color-code your income and expense categories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, add, remove, rename, recolor } = useCategories();
  const { expenses, renameCategoryRefs } = useExpenses();

  const expenseCats = categories.filter((c) => c.kind === "expense");
  const incomeCats = categories.filter((c) => c.kind === "income");

  const handleRename = (c: CategoryDef, name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === c.name) return;
    renameCategoryRefs(c.kind, c.name, trimmed);
    rename(c.id, trimmed);
  };

  const usageCount = (c: CategoryDef) =>
    expenses.filter((e) => e.kind === c.kind && e.category === c.name).length;

  const handleRemove = (c: CategoryDef) => {
    const n = usageCount(c);
    const msg = n > 0
      ? `Remove "${c.name}"? ${n} entr${n === 1 ? "y still uses" : "ies still use"} it — they will keep the label but lose its color.`
      : `Remove "${c.name}"?`;
    if (confirm(msg)) remove(c.id);
  };

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="px-5 md:px-12 pt-8 md:pt-10 pb-6 md:pb-8 border-b border-foreground/20">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Vol. IV · Index
          </div>
          <h2 className="font-serif text-4xl md:text-6xl mt-3 leading-none">Categories</h2>
          <p className="font-serif italic text-muted-foreground mt-3 max-w-xl">
            Name and color the labels you sort your coins by.
          </p>
        </header>

        <div className="px-5 md:px-12 py-6 md:py-8 grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          <CategorySection
            title="Expense Categories"
            kind="expense"
            items={expenseCats}
            usageCount={usageCount}
            onAdd={(name) => add("expense", name)}
            onRename={handleRename}
            onRemove={handleRemove}
            onRecolor={(id, color) => recolor(id, color)}
          />
          <CategorySection
            title="Income Categories"
            kind="income"
            items={incomeCats}
            usageCount={usageCount}
            onAdd={(name) => add("income", name)}
            onRename={handleRename}
            onRemove={handleRemove}
            onRecolor={(id, color) => recolor(id, color)}
          />
        </div>
      </main>
    </div>
  );
}

function CategorySection({
  title,
  kind,
  items,
  usageCount,
  onAdd,
  onRename,
  onRemove,
  onRecolor,
}: {
  title: string;
  kind: TxKind;
  items: CategoryDef[];
  usageCount: (c: CategoryDef) => number;
  onAdd: (name: string) => void;
  onRename: (c: CategoryDef, name: string) => void;
  onRemove: (c: CategoryDef) => void;
  onRecolor: (id: string, color: string) => void;
}) {
  const [draft, setDraft] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = draft.trim();
    if (!n) return;
    onAdd(n);
    setDraft("");
  };

  return (
    <section className="border border-foreground/20 bg-card p-5 md:p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-serif text-xl">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {items.length} · {kind}
        </span>
      </div>
      <div className="rule mb-5" />

      <ul className="divide-y divide-foreground/10">
        {items.map((c) => (
          <CategoryRow
            key={c.id}
            cat={c}
            usage={usageCount(c)}
            onRename={(name) => onRename(c, name)}
            onRecolor={(color) => onRecolor(c.id, color)}
            onRemove={() => onRemove(c)}
          />
        ))}
        {items.length === 0 && (
          <li className="font-serif italic text-muted-foreground text-sm py-6">
            No categories yet — add one below.
          </li>
        )}
      </ul>

      <form onSubmit={submit} className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-end">
        <label className="block flex-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            New {kind} category
          </div>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={kind === "income" ? "Dividends, Bonus…" : "Subscriptions, Gifts…"}
            maxLength={40}
            className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-serif italic text-base py-1"
          />
        </label>
        <button
          type="submit"
          className="font-mono text-xs uppercase tracking-[0.2em] px-5 py-3 bg-foreground text-background hover:bg-foreground/80 transition-colors"
        >
          Add →
        </button>
      </form>
    </section>
  );
}

function CategoryRow({
  cat,
  usage,
  onRename,
  onRecolor,
  onRemove,
}: {
  cat: CategoryDef;
  usage: number;
  onRename: (name: string) => void;
  onRecolor: (color: string) => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(cat.name);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-label="Change color"
          className="w-6 h-6 rounded-full shrink-0 ring-1 ring-foreground/15 ring-offset-2 ring-offset-card transition-transform hover:scale-110"
          style={{ background: cat.color }}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onRename(name)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setName(cat.name);
          }}
          maxLength={40}
          className="flex-1 min-w-0 bg-transparent border-b border-transparent focus:border-foreground outline-none font-serif text-base py-1"
        />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {usage} {usage === 1 ? "entry" : "entries"}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${cat.name}`}
          className="font-mono text-base text-muted-foreground hover:text-destructive p-1"
        >
          ✕
        </button>
      </div>

      {pickerOpen && (
        <div className="mt-3 ml-9 flex flex-wrap gap-2">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { onRecolor(c); setPickerOpen(false); }}
              aria-label={`Set color ${c}`}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                cat.color.toLowerCase() === c.toLowerCase() ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      )}
    </li>
  );
}
