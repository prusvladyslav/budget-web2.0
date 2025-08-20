"use client";
import {
  createContext,
  useContext,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import type { SelectUser } from "@/db/schema";
import { useCycleState } from "./useCycleState";

interface MainTableContextType {
  selectedCycleId: string;
  selectedSubcycleId: string;
  selectedCategoryId: string | null;
  updateCategoryId: (categoryId: string | null) => void;
  updateCycleId: (cycleId: string) => void;
  updateSubcycleId: (subcycleId: string) => void;
  cycles:
    | {
        id: string;
        title: string;
      }[]
    | null;
  selectedCycle:
    | {
        id: string;
        title: string;
      }
    | undefined;
  moveBudgetCategoryId: string | null;
  updateMoveBudgetCategoryId: (categoryId: string | null) => void;
}

const MainTableContext = createContext<MainTableContextType | undefined>(
  undefined
);

export function CycleContext({
  children,
  user,
  cycles,
}: {
  children: ReactNode;
  user: SelectUser;
  cycles:
    | {
        id: string;
        title: string;
      }[]
    | null;
}) {
  const {
    selectedCycleId,
    selectedSubcycleId,
    updateCycleId,
    updateSubcycleId,
  } = useCycleState(
    user.lastOpenedCycleId || cycles?.[0]?.id || "",
    user.lastOpenedSubcycleId || ""
  );
  const selectedCycle = useMemo(
    () => cycles?.find((c) => c.id === selectedCycleId),
    [selectedCycleId, cycles]
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [moveBudgetCategoryId, setMoveBudgetCategoryId] = useState<
    string | null
  >(null);

  const contextValue = useMemo(
    () => ({
      selectedCycleId,
      selectedSubcycleId,
      selectedCategoryId,
      updateCategoryId: (categoryId: string | null) =>
        setSelectedCategoryId(categoryId),
      updateMoveBudgetCategoryId: (categoryId: string | null) =>
        setMoveBudgetCategoryId(categoryId),
      moveBudgetCategoryId,
      updateCycleId,
      updateSubcycleId,
      cycles,
      selectedCycle,
    }),
    [
      selectedCycleId,
      selectedSubcycleId,
      selectedCategoryId,
      moveBudgetCategoryId,
      updateCycleId,
      updateSubcycleId,
      cycles,
      selectedCycle,
    ]
  );

  return (
    <MainTableContext.Provider value={contextValue}>
      {children}
    </MainTableContext.Provider>
  );
}

export function useCycleContext() {
  const context = useContext(MainTableContext);
  if (context === undefined) {
    throw new Error("useCycleContext must be used within a CycleContext");
  }
  return context;
}
