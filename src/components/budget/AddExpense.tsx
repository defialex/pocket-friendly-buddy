import { useEffect, useMemo, useState } from "react";
import {
  useCategories,
  type Entry,
  type MeasurementType,
  formatValue,
  labelForMeasurementType,
  DEFAULT_BOARD_ID,
} from "@/lib/budget-store";

function todayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function AddExpense({
  onAdd,
  boardId = DEFAULT_BOARD_ID,
}: {
  onAdd: (e: Omit<Entry, "id" | "boardId">) => void;
  boardId?: string;
}) {
  const { categories } = useCategories(boardId);

  const [value, setValue] = useState("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState(todayDateInputValue);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.name === category),
    [categories, category],
  );

  const measurementType: MeasurementType = selectedCategory?.measurementType ?? "times";

  useEffect(() => {
    if (categories.length === 0) {
      setCategory("");
      return;
    }

    if (!categories.some((c) => c.name === category)) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const n = parseFloat(value);
    if (!n || n <= 0 || !category) return;

    onAdd({
      value: n,
      category,
      note: category,
      date,
      measurementType,
    });

    setValue("");
    setDate(todayDateInputValue());
  };

  const selectedColor = selectedCategory?.color ?? "#2d2d2d";

  const valueLabel = labelForMeasurementType(measurementType);

  const valuePrefix = measurementType === "euro" ? "€" : "";
  const valueSuffix =
    measurementType === "hours"
      ? "h"
      : measurementType === "times"
        ? "×"
        : measurementType === "km"
          ? "km"
          : "";
  const valuePlaceholder =
    measurementType === "euro" ? "0.00" : measurementType === "km" ? "12.5" : "0";

  return (
    <form
      onSubmit={submit}
      className="border border-foreground/10 bg-card emotional-surface overflow-hidden"
    >
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="p-6 sm:p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-foreground/10 bg-accent/20">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              New Signal
            </div>
            <h3 className="mt-3 font-serif text-4xl leading-none">Log what matters.</h3>
          </div>

          <label className="block mt-8 md:mt-10">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              {valueLabel}
            </div>

            <div className="flex items-baseline gap-3 rounded-3xl bg-card px-5 py-4 border border-foreground/10 focus-within:border-foreground/30 transition-colors">
              {valuePrefix && <span className="font-serif text-4xl">{valuePrefix}</span>}

              <input
                type="number"
                inputMode="decimal"
                step={measurementType === "times" ? "1" : "0.25"}
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={valuePlaceholder}
                className="w-full bg-transparent outline-none font-sans font-semibold text-5xl md:text-6xl leading-none placeholder:text-muted-foreground/35 tabular-nums"
              />

              {valueSuffix && <span className="font-serif text-4xl">{valueSuffix}</span>}
            </div>

            <p className="mt-4 text-muted-foreground leading-7">
              {category
                ? `This will be saved as ${formatValue(
                    parseFloat(value) || 0,
                    measurementType,
                  )} for ${category}.`
                : "Create a category for this dashboard first, then record your progress."}
            </p>
          </label>
        </div>

        <div className="p-6 sm:p-8 md:p-10">
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-secondary/40 border border-foreground/10 focus:border-foreground/30 outline-none font-mono text-sm px-4 py-3"
              />
            </Field>

            <Field label="Category">
              <div className="flex items-center gap-3 bg-secondary/40 border border-foreground/10 focus-within:border-foreground/30 px-4 py-3 rounded-2xl transition-colors">
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
            </Field>
          </div>

          <div className="mt-10 flex justify-between items-center gap-6">
            <p className="hidden md:block text-sm text-muted-foreground max-w-xs leading-6">
              Choose a category, enter the value, and keep the record moving.
            </p>

            <button
              type="submit"
              disabled={categories.length === 0}
              className="w-full md:w-auto font-mono text-xs uppercase tracking-[0.25em] px-7 py-4 bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Record
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
