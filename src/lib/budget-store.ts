import { useEffect, useState, useCallback } from "react";

export type Category =
  | "Groceries"
  | "Dining"
  | "Transport"
  | "Housing"
  | "Utilities"
  | "Entertainment"
  | "Health"
  | "Shopping"
  | "Other";

export const CATEGORIES: Category[] = [
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

export type Expense = {
  id: string;
  amount: number;
  category: Category;
  note: string;
  date: string; // ISO yyyy-mm-dd
};

const KEY = "ledger.expenses.v1";

function load(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as Expense[];
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
    { id: crypto.randomUUID(), amount: 42.18, category: "Groceries", note: "Weekly market", date: d(0) },
    { id: crypto.randomUUID(), amount: 14.5, category: "Dining", note: "Espresso & pastry", date: d(1) },
    { id: crypto.randomUUID(), amount: 68.0, category: "Transport", note: "Monthly transit pass", date: d(2) },
    { id: crypto.randomUUID(), amount: 23.99, category: "Entertainment", note: "Cinema", date: d(3) },
    { id: crypto.randomUUID(), amount: 1200.0, category: "Housing", note: "Rent", date: d(5) },
    { id: crypto.randomUUID(), amount: 56.4, category: "Utilities", note: "Electric bill", date: d(7) },
    { id: crypto.randomUUID(), amount: 89.2, category: "Shopping", note: "New notebook & pens", date: d(9) },
    { id: crypto.randomUUID(), amount: 31.0, category: "Health", note: "Pharmacy", date: d(12) },
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

  return { expenses, add, remove };
}

export function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
