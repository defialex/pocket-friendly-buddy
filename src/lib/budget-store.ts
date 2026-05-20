import { useEffect, useState, useCallback } from "react";

export type TxKind = "expense" | "income";

export type ExpenseCategory =
  | "Groceries"
  | "Dining"
  | "Transport"
  | "Housing"
  | "Utilities"
  | "Entertainment"
  | "Health"
  | "Shopping"
  | "Other";

export type IncomeCategory =
  | "Salary"
  | "Freelance"
  | "Investments"
  | "Gifts"
  | "Refunds"
  | "Other Income";

export type Category = ExpenseCategory | IncomeCategory;

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Groceries",
  "Dining",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  "Salary",
  "Freelance",
  "Investments",
  "Gifts",
  "Refunds",
  "Other Income",
];

/** @deprecated kept for backwards-compat */
export const CATEGORIES = EXPENSE_CATEGORIES;

export type Expense = {
  id: string;
  amount: number;
  category: Category;
  note: string;
  date: string; // ISO yyyy-mm-dd
  kind: TxKind;
};

const KEY = "ledger.expenses.v2";
const OLD_KEY = "ledger.expenses.v1";

function migrate(): Expense[] | null {
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

function load(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Expense[];
    const m = migrate();
    if (m) return m;
    return seed();
  } catch {
    return [];
  }
}

function seed(): Expense[] {
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

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setExpenses(load());
  }, []);

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

  return { expenses, add, remove, update };
}

export function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function categoriesFor(kind: TxKind): Category[] {
  return kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
