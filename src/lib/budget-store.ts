import { useEffect, useState, useCallback } from "react";

export type TxKind = "expense" | "income";

/** Category is now just a string label; the canonical list lives in useCategories. */
export type Category = string;

export type CategoryDef = {
  id: string;
  name: string;
  color: string; // hex
  kind: TxKind;
};

export type Expense = {
  id: string;
  amount: number;
  category: Category;
  note: string;
  date: string; // ISO yyyy-mm-dd
  kind: TxKind;
};

/* ---------------- Color palette ---------------- */

export const COLOR_PALETTE = [
  "#2d2d2d", // ink
  "#8b6f47", // walnut
  "#a0522d", // sienna
  "#c4654a", // terracotta
  "#d4a574", // sand
  "#87a878", // sage
  "#4a6741", // forest
  "#2d8a9e", // teal
  "#1e3a5f", // navy
  "#9b4423", // rust
  "#c44569", // plum
  "#574b90", // ink-violet
];

/* ---------------- Default seeds ---------------- */

const DEFAULT_EXPENSE: Array<[string, string]> = [
  ["Groceries", "#87a878"],
  ["Dining", "#c4654a"],
  ["Transport", "#2d8a9e"],
  ["Housing", "#1e3a5f"],
  ["Utilities", "#574b90"],
  ["Entertainment", "#c44569"],
  ["Health", "#9b4423"],
  ["Shopping", "#d4a574"],
  ["Other", "#2d2d2d"],
];

const DEFAULT_INCOME: Array<[string, string]> = [
  ["Salary", "#4a6741"],
  ["Freelance", "#2d8a9e"],
  ["Investments", "#8b6f47"],
  ["Gifts", "#c44569"],
  ["Refunds", "#d4a574"],
  ["Other Income", "#2d2d2d"],
];

/** Legacy exports kept so existing imports still resolve (use useCategories at runtime). */
export const EXPENSE_CATEGORIES: string[] = DEFAULT_EXPENSE.map(([n]) => n);
export const INCOME_CATEGORIES: string[] = DEFAULT_INCOME.map(([n]) => n);
export const CATEGORIES = EXPENSE_CATEGORIES;

/* ---------------- Storage ---------------- */

const KEY = "ledger.expenses.v2";
const OLD_KEY = "ledger.expenses.v1";
const CAT_KEY = "ledger.categories.v1";

function migrateExpenses(): Expense[] | null {
  try {
    const raw = localStorage.getItem(OLD_KEY);
    if (!raw) return null;
    const old = JSON.parse(raw) as Array<Omit<Expense, "kind"> & { kind?: TxKind }>;
    const migrated = old.map((e) => ({ ...e, kind: (e.kind ?? "expense") as TxKind }));
    localStorage.setItem(KEY, JSON.stringify(migrated));
    localStorage.removeItem(OLD_KEY);
    return migrated;
  } catch {
    return null;
  }
}

function seedExpenses(): Expense[] {
  const today = new Date();
  const d = (offset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - offset);
    return dt.toISOString().slice(0, 10);
  };
  const items: Expense[] = [
    { id: crypto.randomUUID(), amount: 3200, category: "Salary", note: "Monthly salary", date: d(2), kind: "income" },
    { id: crypto.randomUUID(), amount: 450, category: "Freelance", note: "Design work", date: d(6), kind: "income" },
    { id: crypto.randomUUID(), amount: 42.18, category: "Groceries", note: "Weekly market", date: d(0), kind: "expense" },
    { id: crypto.randomUUID(), amount: 14.5, category: "Dining", note: "Espresso & pastry", date: d(1), kind: "expense" },
    { id: crypto.randomUUID(), amount: 68.0, category: "Transport", note: "Monthly transit pass", date: d(2), kind: "expense" },
    { id: crypto.randomUUID(), amount: 23.99, category: "Entertainment", note: "Cinema", date: d(3), kind: "expense" },
    { id: crypto.randomUUID(), amount: 1200.0, category: "Housing", note: "Rent", date: d(5), kind: "expense" },
    { id: crypto.randomUUID(), amount: 56.4, category: "Utilities", note: "Electric bill", date: d(7), kind: "expense" },
    { id: crypto.randomUUID(), amount: 89.2, category: "Shopping", note: "New notebook & pens", date: d(9), kind: "expense" },
    { id: crypto.randomUUID(), amount: 31.0, category: "Health", note: "Pharmacy", date: d(12), kind: "expense" },
  ];
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  return items;
}

function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Expense[];
    const m = migrateExpenses();
    if (m) return m;
    return seedExpenses();
  } catch { return []; }
}

function seedCategories(): CategoryDef[] {
  const cats: CategoryDef[] = [
    ...DEFAULT_EXPENSE.map(([name, color]) => ({
      id: crypto.randomUUID(), name, color, kind: "expense" as TxKind,
    })),
    ...DEFAULT_INCOME.map(([name, color]) => ({
      id: crypto.randomUUID(), name, color, kind: "income" as TxKind,
    })),
  ];
  try { localStorage.setItem(CAT_KEY, JSON.stringify(cats)); } catch {}
  return cats;
}

function loadCategories(): CategoryDef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CAT_KEY);
    if (raw) return JSON.parse(raw) as CategoryDef[];
    return seedCategories();
  } catch { return []; }
}

/* ---------------- Hooks ---------------- */

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => { setExpenses(loadExpenses()); }, []);

  const persist = useCallback((next: Expense[]) => {
    setExpenses(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }, []);

  const add = useCallback((e: Omit<Expense, "id">) => {
    persist([{ ...e, id: crypto.randomUUID() }, ...expenses]);
  }, [expenses, persist]);

  const remove = useCallback((id: string) => {
    persist(expenses.filter((e) => e.id !== id));
  }, [expenses, persist]);

  const update = useCallback((id: string, patch: Partial<Omit<Expense, "id">>) => {
    persist(expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, [expenses, persist]);

  const renameCategoryRefs = useCallback(
    (kind: TxKind, oldName: string, newName: string) => {
      if (oldName === newName) return;
      persist(
        expenses.map((e) =>
          e.kind === kind && e.category === oldName ? { ...e, category: newName } : e,
        ),
      );
    },
    [expenses, persist],
  );

  return { expenses, add, remove, update, renameCategoryRefs };
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryDef[]>([]);

  useEffect(() => { setCategories(loadCategories()); }, []);

  const persist = useCallback((next: CategoryDef[]) => {
    setCategories(next);
    try { localStorage.setItem(CAT_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const add = useCallback((kind: TxKind, name: string, color?: string) => {
    const c: CategoryDef = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: color || COLOR_PALETTE[categories.length % COLOR_PALETTE.length],
      kind,
    };
    persist([...categories, c]);
    return c;
  }, [categories, persist]);

  const remove = useCallback((id: string) => {
    persist(categories.filter((c) => c.id !== id));
  }, [categories, persist]);

  const rename = useCallback((id: string, name: string) => {
    persist(categories.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)));
  }, [categories, persist]);

  const recolor = useCallback((id: string, color: string) => {
    persist(categories.map((c) => (c.id === id ? { ...c, color } : c)));
  }, [categories, persist]);

  return { categories, add, remove, rename, recolor };
}

/* ---------------- Helpers ---------------- */

export function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function categoriesFor(kind: TxKind): string[] {
  return kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function colorForCategory(
  categories: CategoryDef[],
  name: string,
  kind: TxKind,
): string {
  return categories.find((c) => c.kind === kind && c.name === name)?.color ?? "#2d2d2d";
}
