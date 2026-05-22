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

export const DEFAULT_BOARD_ID = "main";
export const CURRENT_BOARD_ID_KEY = "ledger.currentBoardId";
const CURRENT_BOARD_EVENT = "ledger:current-board";

export type MeasurementType = "hours" | "times" | "euro";

export type Board = {
  id: string;
  name: string;
  createdAt: string;
};

export type CategoryDef = {
  id: string;
  boardId: string;
  name: string;
  color: string;
  measurementType: MeasurementType;
  weeklyGoal?: number;
  monthlyGoal?: number;
};

export type Entry = {
  id: string;
  boardId: string;
  value: number;
  category: string;
  note: string;
  date: string;
  measurementType?: MeasurementType;
};

export type Expense = Entry;

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

const boardsRef = collection(db, "boards");
const entriesRef = collection(db, "expenses");
const categoriesRef = collection(db, "categories");

type FirestoreData = Record<string, unknown>;

function stringField(data: FirestoreData, key: string, fallback = "") {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

function numberField(data: FirestoreData, key: string, fallback = 0) {
  const value = data[key];
  return typeof value === "number" ? value : fallback;
}

function measurementTypeField(
  data: FirestoreData,
  key: string,
  fallback: MeasurementType = "times",
): MeasurementType {
  const value = data[key];
  return value === "hours" || value === "times" || value === "euro" ? value : fallback;
}

function categoryFromDoc(id: string, data: FirestoreData): CategoryDef {
  const weeklyGoal = data.weeklyGoal;
  const monthlyGoal = data.monthlyGoal;

  return {
    id,
    boardId: stringField(data, "boardId", DEFAULT_BOARD_ID),
    name: stringField(data, "name"),
    color: stringField(data, "color", "#2d2d2d"),
    measurementType: measurementTypeField(data, "measurementType"),
    weeklyGoal: weeklyGoal === undefined || weeklyGoal === null ? undefined : Number(weeklyGoal),
    monthlyGoal:
      monthlyGoal === undefined || monthlyGoal === null ? undefined : Number(monthlyGoal),
  };
}

export function getCurrentBoardId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(CURRENT_BOARD_ID_KEY) ?? "";
}

export function setCurrentBoardId(boardId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_BOARD_ID_KEY, boardId);
  window.dispatchEvent(new CustomEvent(CURRENT_BOARD_EVENT, { detail: boardId }));
}

export function useCurrentBoardId() {
  const [boardId, setBoardId] = useState(() => getCurrentBoardId());

  useEffect(() => {
    const sync = () => setBoardId(getCurrentBoardId());
    sync();

    window.addEventListener("storage", sync);
    window.addEventListener(CURRENT_BOARD_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CURRENT_BOARD_EVENT, sync);
    };
  }, []);

  return boardId;
}

export function slugifyBoardName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "board"
  );
}

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(boardsRef, (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();

        return {
          id: d.id,
          name: stringField(data, "name", d.id),
          createdAt: stringField(data, "createdAt"),
        } as Board;
      });

      items.sort((a, b) => a.name.localeCompare(b.name));
      setBoards(items);
    });

    return () => unsubscribe();
  }, []);

  const add = useCallback(async (name: string) => {
    const cleanName = name.trim();
    const id = slugifyBoardName(cleanName);

    const board: Board = {
      id,
      name: cleanName,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "boards", id), board);

    return board;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "boards", id));
  }, []);

  const updateBoard = useCallback(async (id: string, patch: Partial<Omit<Board, "id">>) => {
    await updateDoc(doc(db, "boards", id), patch);
  }, []);

  return {
    boards,
    add,
    remove,
    updateBoard,
  };
}

export function useExpenses(boardId: string = DEFAULT_BOARD_ID) {
  const [expenses, setExpenses] = useState<Entry[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(entriesRef, (snapshot) => {
      const items = snapshot.docs
        .map((d) => {
          const data = d.data();

          return {
            id: d.id,
            boardId: stringField(data, "boardId", DEFAULT_BOARD_ID),
            value: numberField(data, "value", numberField(data, "amount")),
            category: stringField(data, "category"),
            note: stringField(data, "note"),
            date: stringField(data, "date"),
            measurementType: measurementTypeField(data, "measurementType"),
          } as Entry;
        })
        .filter((entry) => entry.boardId === boardId);

      items.sort((a, b) => b.date.localeCompare(a.date));
      setExpenses(items);
    });

    return () => unsubscribe();
  }, [boardId]);

  const add = useCallback(
    async (entry: Omit<Entry, "id" | "boardId">) => {
      await addDoc(entriesRef, {
        ...entry,
        boardId,
      });
    },
    [boardId],
  );

  const remove = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "expenses", id));
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Omit<Entry, "id">>) => {
    await updateDoc(doc(db, "expenses", id), patch);
  }, []);

  return {
    expenses,
    add,
    remove,
    update,
  };
}

export function useCategories(boardId: string = DEFAULT_BOARD_ID) {
  const [categories, setCategories] = useState<CategoryDef[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      const items = snapshot.docs
        .map((d) => {
          return categoryFromDoc(d.id, d.data());
        })
        .filter((category) => category.boardId === boardId);

      items.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(items);
    });

    return () => unsubscribe();
  }, [boardId]);

  const add = useCallback(
    async (
      name: string,
      measurementType: MeasurementType,
      color?: string,
      weeklyGoal?: number,
      monthlyGoal?: number,
    ) => {
      const newRef = doc(categoriesRef);

      const category: CategoryDef = {
        id: newRef.id,
        boardId,
        name: name.trim(),
        measurementType,
        color: color || COLOR_PALETTE[0],
        ...(weeklyGoal ? { weeklyGoal } : {}),
        ...(monthlyGoal ? { monthlyGoal } : {}),
      };

      await setDoc(newRef, category);

      return category;
    },
    [boardId],
  );

  const remove = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
  }, []);

  const updateCategory = useCallback(
    async (id: string, patch: Partial<Omit<CategoryDef, "id">>) => {
      await updateDoc(doc(db, "categories", id), patch);
    },
    [],
  );

  return {
    categories,
    add,
    remove,
    updateCategory,
  };
}

export function useAllCategories() {
  const [categories, setCategories] = useState<CategoryDef[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      const items = snapshot.docs.map((d) => categoryFromDoc(d.id, d.data()));

      items.sort((a, b) => {
        const boardOrder = a.boardId.localeCompare(b.boardId);
        return boardOrder || a.name.localeCompare(b.name);
      });

      setCategories(items);
    });

    return () => unsubscribe();
  }, []);

  return { categories };
}

export function formatValue(value: number | undefined | null, measurementType?: MeasurementType) {
  const safeValue = Number(value ?? 0);

  if (measurementType === "euro") {
    return safeValue.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  }

  if (measurementType === "hours") {
    return `${safeValue.toLocaleString("de-DE")} h`;
  }

  if (measurementType === "times") {
    return `${safeValue.toLocaleString("de-DE")}×`;
  }

  return safeValue.toLocaleString("de-DE");
}

export function formatMoney(value: number) {
  return formatValue(value, "euro");
}

export function colorForCategory(categories: CategoryDef[], name: string) {
  return categories.find((category) => category.name === name)?.color ?? "#2d2d2d";
}

export function measurementTypeForCategory(
  categories: CategoryDef[],
  name: string,
): MeasurementType {
  return categories.find((category) => category.name === name)?.measurementType ?? "times";
}

export function labelForMeasurementType(type: MeasurementType) {
  if (type === "hours") return "Hours";
  if (type === "times") return "Times";
  if (type === "euro") return "Euro";

  return type;
}
