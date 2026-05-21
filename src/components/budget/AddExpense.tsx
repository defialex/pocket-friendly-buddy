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

  useEffect(() => {
    if (list.length === 0) {
      setCategory("");
      return;
    }

    if (!list.some((c) => c.name === category)) {
      setCategory(list[0].name);
    }
  }, [list, category]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const n = parseFloat(amount);
    if (!n || n <= 0 || !category) return;

    onAdd({
      amount: n,
      category,
      note: note.trim() || category,
      date,
      kind,
    });

    setAmount("");
    setNote("");
  };

  const selectedColor = list.find((c) => c.name === category)?.color ?? "#2d2d2d";

  return (
    <form
      onSubmit={submit}
      className="border border-foreground/15 bg-card overflow-hidden"
    >
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left: Amount */}
        <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-foreground/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                New Entry
              </div>
              <h3 className="mt-3 font-serif text-3xl leading-none">
                Record a line.
              </h3>
            </div>

            <div className="flex border border-foreground/20">
              {(["expense", "income"] as TxKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`font-mono text-[10px] uppercase tracking-widest px-3 py-2 transition-colors ${
                    kind === k
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {k === "expense" ? "− Expense" : "+ Income"}
                </button>
              ))}
            </div>
          </div>

          <label className="block mt-10">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Amount
            </div>

            <div className="flex items-baseline gap-3 border-b border-foreground/25 focus-within:border-foreground pb-3">
              <span className="font-serif text-4xl">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent outline-none font-serif text-5xl md:text-6xl leading-none placeholder:text-muted-foreground/40 tabular-nums"
              />
            </div>
          </label>
        </div>

        {/* Right: Details */}
        <div className="p-8 md:p-10">
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/25 focus:border-foreground outline-none font-mono text-sm py-2"
              />
            </Field>

            <Field label="Category">
              <div className="flex items-center gap-3 border-b border-foreground/25 focus-within:border-foreground py-2">
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

          <div className="mt-8">
            <Field label="Memorandum">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={80}
                placeholder={kind === "income" ? "Source of funds?" : "What was it for?"}
                className="w-full bg-transparent border-b border-foreground/25 focus:border-foreground outline-none font-serif italic text-2xl py-3 placeholder:text-muted-foreground/50"
              />
            </Field>
          </div>

          <div className="mt-10 flex justify-between items-center gap-6">
            <p className="hidden md:block font-serif italic text-muted-foreground max-w-xs">
              A small note today becomes a clear account tomorrow.
            </p>

            <button
              type="submit"
              className="w-full md:w-auto font-mono text-xs uppercase tracking-[0.25em] px-7 py-4 bg-foreground text-background hover:bg-foreground/80 transition-colors"
            >
              Record Entry →
            </button>
          </div>
        </div>
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