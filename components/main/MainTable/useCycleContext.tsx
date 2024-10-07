"use client";
import React, {
  createContext,
  useContext,
  type ReactNode,
  useEffect,
  useMemo,
} from "react";
import { SelectCycle, type SelectUser } from "@/db/schema";
import { useCycleState } from "./useCycleState";

interface MainTableContextType {
  selectedCycleId: string;
  selectedSubcycleId: string;
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

  const contextValue = useMemo(
    () => ({
      selectedCycleId,
      selectedSubcycleId,
      updateCycleId,
      updateSubcycleId,
      cycles,
      selectedCycle,
    }),
    [
      selectedCycleId,
      selectedSubcycleId,
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
