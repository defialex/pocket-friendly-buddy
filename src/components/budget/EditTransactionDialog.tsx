import { useEffect, useState } from "react";
import {
  useCategories,
  type Expense,
  type TxKind,
} from "@/lib/budget-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EditTransactionDialog({
  expense,
  onClose,
  onSave,
}: {
  expense: Expense | null;
  onClose: () => void;
  onSave: (patch: Partial<Omit<Expense, "id">>) => void;
}) {
  const { categories } = useCategories();
  const [kind, setKind] = useState<TxKind>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (!expense) return;
    setKind(expense.kind);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setNote(expense.note);
    setDate(expense.date);
  }, [expense]);

  const list = categories.filter((c) => c.kind === kind);

  const switchKind = (next: TxKind) => {
    setKind(next);
    const nextList = categories.filter((c) => c.kind === next);
    if (!nextList.some((c) => c.name === category)) {
      setCategory(nextList[0]?.name ?? "");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0 || !category) return;
    onSave({ amount: n, category, note: note.trim() || category, date, kind });
  };

  const selectedColor = list.find((c) => c.name === category)?.color ?? "#2d2d2d";

  return (
    <Dialog open={!!expense} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-foreground/30 rounded-none max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal">Edit Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5 pt-2">
          <div className="flex border border-foreground/30 w-fit">
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

          <Row label="Amount">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-lg">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-mono text-lg py-1"
              />
            </div>
          </Row>

          <Row label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-mono text-sm py-1"
            />
          </Row>

          <Row label="Memorandum">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={80}
              className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none font-serif italic text-base py-1"
            />
          </Row>

          <Row label="Category">
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
          </Row>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs uppercase tracking-[0.2em] px-4 py-2.5 border border-foreground/30 hover:border-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="font-mono text-xs uppercase tracking-[0.2em] px-6 py-2.5 bg-foreground text-background hover:bg-foreground/80 transition-colors"
            >
              Save →
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </div>
      {children}
    </label>
  );
}
