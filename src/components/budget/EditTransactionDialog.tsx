import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_BOARD_ID,
  useCategories,
  type Expense,
  type MeasurementType,
  formatValue,
  labelForMeasurementType,
} from "@/lib/budget-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function EditTransactionDialog({
  expense,
  boardId = DEFAULT_BOARD_ID,
  onClose,
  onSave,
}: {
  expense: Expense | null;
  boardId?: string;
  onClose: () => void;
  onSave: (patch: Partial<Omit<Expense, "id">>) => void;
}) {
  const { categories } = useCategories(boardId);

  const [value, setValue] = useState("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((c) => c.name === category),
    [categories, category],
  );

  const measurementType: MeasurementType =
    selectedCategory?.measurementType ?? expense?.measurementType ?? "times";

  useEffect(() => {
    if (!expense) return;

    setValue(String(expense.value ?? 0));
    setCategory(expense.category);
    setDate(expense.date);
  }, [expense]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const n = parseFloat(value);
    if (!n || n <= 0 || !category) return;

    onSave({
      value: n,
      category,
      note: category,
      date,
      measurementType,
    });
  };

  const selectedColor = selectedCategory?.color ?? "#2d2d2d";

  return (
    <Dialog open={!!expense} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-foreground/10 rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal">Edit Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5 pt-2">
          <Row label="Category">
            <div className="flex items-center gap-2 bg-secondary/40 border border-foreground/10 focus-within:border-foreground/30 px-4 py-3 rounded-2xl">
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
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} · {labelForMeasurementType(c.measurementType)}
                  </option>
                ))}
              </select>
            </div>
          </Row>

          <Row label={labelForMeasurementType(measurementType)}>
            <div className="flex items-baseline gap-2">
              {measurementType === "euro" && <span className="font-serif text-lg">€</span>}

              <input
                type="number"
                inputMode="decimal"
                step={measurementType === "times" ? "1" : "0.25"}
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-secondary/40 border border-foreground/10 focus:border-foreground/30 outline-none font-mono text-lg px-4 py-3"
              />

              {measurementType === "hours" && <span className="font-serif text-lg">h</span>}

              {measurementType === "times" && <span className="font-serif text-lg">×</span>}

              {measurementType === "km" && <span className="font-serif text-lg">km</span>}
            </div>

            <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Preview: {formatValue(parseFloat(value) || 0, measurementType)}
            </div>
          </Row>

          <Row label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-secondary/40 border border-foreground/10 focus:border-foreground/30 outline-none font-mono text-sm px-4 py-3"
            />
          </Row>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs uppercase tracking-[0.2em] px-5 py-3 border border-foreground/20 hover:border-foreground/40 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="font-mono text-xs uppercase tracking-[0.2em] px-6 py-3 bg-foreground text-background hover:bg-foreground/85 transition-colors"
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
