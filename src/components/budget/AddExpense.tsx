import { useState } from "react";
import { CATEGORIES, type Category, type Expense } from "@/lib/budget-store";

export function AddExpense({ onAdd }: { onAdd: (e: Omit<Expense, "id">) => void }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Groceries");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    onAdd({ amount: n, category, note: note.trim() || category, date });
    setAmount("");
    setNote("");
  };

  return (
    <form onSubmit={submit} className="border border-foreground/20 bg-card p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-serif text-xl">New Entry</h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          § Ledger
        </span>
      </div>
      <div className="rule mb-5" />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_auto] gap-4 items-end">
        <Field label="Amount">
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-lg">$</span>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-mono text-lg py-1"
            />
          </div>
        </Field>

        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-mono text-sm py-1"
          />
        </Field>

        <Field label="Memorandum">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={80}
            placeholder="What was it for?"
            className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-serif italic text-base py-1"
          />
        </Field>

        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-mono text-xs uppercase tracking-wider py-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="font-mono text-xs uppercase tracking-[0.2em] px-6 py-3 bg-foreground text-background hover:bg-foreground/80 transition-colors"
        >
          Record Entry →
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </div>
      {children}
    </label>
  );
}
