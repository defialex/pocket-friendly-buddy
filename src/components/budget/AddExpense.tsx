import { useEffect, useState } from "react";
import {
  useCategories,
  type Expense,
  type TxKind,
} from "@/lib/budget-store";

export function AddExpense({ onAdd }: { onAdd: (e: Omit<Expense, "id">) => void }) {
  const { categories } = useCategories();
  const [kind, setKind] = useState<TxKind>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const list = categories.filter((c) => c.kind === kind);

  // ensure category selection is valid
  useEffect(() => {
    if (list.length === 0) { setCategory(""); return; }
    if (!list.some((c) => c.name === category)) setCategory(list[0].name);
  }, [list, category]);

  const switchKind = (next: TxKind) => setKind(next);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0 || !category) return;
    onAdd({ amount: n, category, note: note.trim() || category, date, kind });
    setAmount("");
    setNote("");
  };

  const selectedColor = list.find((c) => c.name === category)?.color ?? "#2d2d2d";

  return (
    <form onSubmit={submit} className="border border-foreground/20 bg-card p-5 md:p-6">
      <div className="flex items-baseline justify-between mb-5 gap-4 flex-wrap">
        <h3 className="font-serif text-xl">New Entry</h3>
        <div className="flex border border-foreground/30">
          {(["expense", "income"] as TxKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => switchKind(k)}
              className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 transition-colors ${
                kind === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {k === "expense" ? "− Expense" : "+ Income"}
            </button>
          ))}
        </div>
      </div>
      <div className="rule mb-5" />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_auto] gap-4 md:items-end">
        <Field label="Amount">
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-lg">$</span>
            <input
              type="number"
              inputMode="decimal"
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
            placeholder={kind === "income" ? "Source of funds?" : "What was it for?"}
            className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-serif italic text-base py-1"
          />
        </Field>

        <Field label="Category">
          <div className="flex items-center gap-2 border-b border-foreground/30 focus-within:border-foreground py-1">
            <span
              aria-hidden
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ background: selectedColor }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent outline-none font-mono text-xs uppercase tracking-wider appearance-none"
            >
              {list.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </Field>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="w-full md:w-auto font-mono text-xs uppercase tracking-[0.2em] px-6 py-3 bg-foreground text-background hover:bg-foreground/80 transition-colors"
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
