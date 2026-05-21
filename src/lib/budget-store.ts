import { useEffect, useState, useCallback } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export type TxKind = "expense" | "income";
export type Category = string;

export type CategoryDef = {
  id: string;
  name: string;
  color: string;
  kind: TxKind;
};

export type Expense = {
  id: string;
  amount: number;
  category: Category;
  note: string;
  date: string;
  kind: TxKind;
};

export const COLOR_PALETTE = [
  "#2d2d2d",
  "#8b6f47",
  "#a0522d",
  "#c4654a",
  "#d4a574",
  "#87a878",
  "#4a6741",
  "#2d8a9e",
  "#1e3a5f",
  "#9b4423",
  "#c44569",
  "#574b90",
];

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

export const EXPENSE_CATEGORIES: string[] = DEFAULT_EXPENSE.map(([n]) => n);
export const INCOME_CATEGORIES: string[] = DEFAULT_INCOME.map(([n]) => n);
export const CATEGORIES = EXPENSE_CATEGORIES;

const expensesRef = collection(db, "expenses");
const categoriesRef = collection(db, "categories");

async function seedDefaultCategoriesOnce() {
  const defaults: CategoryDef[] = [
    ...DEFAULT_EXPENSE.map(([name, color]) => ({
      id: `expense-${name.toLowerCase().replaceAll(" ", "-")}`,
      name,
      color,
      kind: "expense" as TxKind,
    })),
    ...DEFAULT_INCOME.map(([name, color]) => ({
      id: `income-${name.toLowerCase().replaceAll(" ", "-")}`,
      name,
      color,
      kind: "income" as TxKind,
    })),
  ];

  await Promise.all(
    defaults.map((cat) => setDoc(doc(db, "categories", cat.id), cat))
  );
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Expense, "id">),
      }));

      items.sort((a, b) => b.date.localeCompare(a.date));
      setExpenses(items);
    });

    return () => unsubscribe();
  }, []);

  const add = useCallback(async (e: Omit<Expense, "id">) => {
    await addDoc(expensesRef, e);
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "expenses", id));
  }, []);

  const update = useCallback(
    async (id: string, patch: Partial<Omit<Expense, "id">>) => {
      await updateDoc(doc(db, "expenses", id), patch);
    },
    []
  );

  const renameCategoryRefs = useCallback(
    async (kind: TxKind, oldName: string, newName: string) => {
      if (oldName === newName) return;

      const matching = expenses.filter(
        (e) => e.kind === kind && e.category === oldName
      );

      await Promise.all(
        matching.map((e) =>
          updateDoc(doc(db, "expenses", e.id), { category: newName })
        )
      );
    },
    [expenses]
  );

  return { expenses, add, remove, update, renameCategoryRefs };
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryDef[]>([]);

  useEffect(() => {
    seedDefaultCategoriesOnce();

    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CategoryDef, "id">),
      }));

      setCategories(items);
    });

    return () => unsubscribe();
  }, []);

  const add = useCallback(
    async (kind: TxKind, name: string, color?: string) => {
      const cleanName = name.trim();
      const newRef = doc(categoriesRef);

      const c: CategoryDef = {
        id: newRef.id,
        name: cleanName,
        color: color || COLOR_PALETTE[categories.length % COLOR_PALETTE.length],
        kind,
      };

      await setDoc(newRef, c);
      return c;
    },
    [categories.length]
  );

  const remove = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
  }, []);

  const rename = useCallback(async (id: string, name: string) => {
    await updateDoc(doc(db, "categories", id), { name: name.trim() });
  }, []);

  const recolor = useCallback(async (id: string, color: string) => {
    await updateDoc(doc(db, "categories", id), { color });
  }, []);

  return { categories, add, remove, rename, recolor };
}

export function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function categoriesFor(kind: TxKind): string[] {
  return kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function colorForCategory(
  categories: CategoryDef[],
  name: string,
  kind: TxKind
): string {
  return categories.find((c) => c.kind === kind && c.name === name)?.color ?? "#2d2d2d";
}