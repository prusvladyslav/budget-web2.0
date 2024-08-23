"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { SelectCycle, SelectUser } from "@/db/schema";
import { useCycleState } from "./useCycleState";

interface MainTableContextType {
  selectedCycle: string;
  selectedSubcycle: string;
  updateCycle: (cycleId: string) => void;
  updateSubcycle: (subcycleId: string) => void;
}

const MainTableContext = createContext<MainTableContextType | undefined>(
  undefined
);

export function MainTableProvider({
  children,
  user,
  cycles,
}: {
  children: ReactNode;
  user: SelectUser;
  cycles: SelectCycle[] | null;
}) {
  const { selectedCycle, selectedSubcycle, updateCycle, updateSubcycle } =
    useCycleState(
      user.lastOpenedCycleId || cycles?.[0]?.id || "",
      user.lastOpenedSubcycleId || ""
    );

  return (
    <MainTableContext.Provider
      value={{ selectedCycle, selectedSubcycle, updateCycle, updateSubcycle }}
    >
      {children}
    </MainTableContext.Provider>
  );
}

export function useCycleContext() {
  const context = useContext(MainTableContext);
  if (context === undefined) {
    throw new Error("useCycleContext must be used within a MainTableProvider");
  }
  return context;
}
