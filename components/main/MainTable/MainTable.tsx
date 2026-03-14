"use client";
import { Tabs } from "@/components/ui/tabs";
import MainTableHeader from "../MainTableHeader";
import type { SelectUser } from "@/db/schema";
import CycleTab from "../CycleTab";
import { CycleContext, useCycleContext } from "./useCycleContext";
import { BurgerMenu } from "@/components/common/BurgerMenu";
import AddNewExpense from "@/components/modals/AddNewExpense/AddNewExpense";
import { useSearchParams } from "next/navigation";
import MoveBudget from "@/components/modals/MoveBudget/MoveBudget";
import type React from "react";

function MainTableContent({
  user,
  cycles,
  children,
}: {
  user: SelectUser;
  cycles:
  | {
    id: string;
    title: string;
  }[]
  | null;
  children: React.ReactNode;
}) {
  const {
    selectedCycleId,
    updateCycleId,
    selectedCategoryId,
    moveBudgetCategoryId,
  } = useCycleContext();

  const hasCycles = cycles && cycles.length > 0;

  return (
    <Tabs
      value={selectedCycleId}
      onValueChange={updateCycleId}
      className="w-full"
    >
      <div className="flex items-center gap-2 p-2">
        <BurgerMenu user={user} />
        {hasCycles && <MainTableHeader />}
        {children}
      </div>

      {hasCycles && <CycleTab />}
      <AddNewExpense
        categoryId={selectedCategoryId}
        open={!!selectedCategoryId}
      />
      {moveBudgetCategoryId && (
        <MoveBudget
          categoryId={moveBudgetCategoryId}
          open={moveBudgetCategoryId !== null}
        />
      )}
    </Tabs>
  );
}

export default function MainTable({
  cycles,
  user,
  children,
}: {
  cycles:
  | {
    id: string;
    title: string;
  }[]
  | null;
  user: SelectUser | undefined;
  children?: React.ReactNode;
}) {
  if (!user) return null;

  return (
    <CycleContext user={user} cycles={cycles}>
      <MainTableContent user={user} cycles={cycles}>
        {children}
      </MainTableContent>
    </CycleContext>
  );
}
