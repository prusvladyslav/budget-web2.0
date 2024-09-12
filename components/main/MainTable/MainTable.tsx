"use client";
import { Tabs, TabsList } from "@/components/ui/tabs";
import MainTableHeader from "../MainTableHeader";
import { SelectUser } from "@/db/schema";
import CycleTab from "../CycleTab";
import { CycleContext, useCycleContext } from "./useCycleContext";
import { BurgerMenu } from "@/components/common/BurgerMenu";
import QuickMenu from "../QuickMenu/QuickMenu";
import AddNewExpense from "@/components/modals/AddNewExpense/AddNewExpense";
import { useSearchParams } from "next/navigation";
import MoveBudget from "@/components/modals/MoveBudget/MoveBudget";

function MainTableContent({
  user,
  cycles,
}: {
  user: SelectUser;
  cycles:
    | {
        id: string;
        title: string;
      }[]
    | null;
}) {
  const { selectedCycleId, updateCycleId } = useCycleContext();
  const hasCycles = cycles && cycles.length > 0;
  const searchParams = useSearchParams();
  const categoryId = searchParams?.get("categoryId");
  const monthly = searchParams?.get("monthly");
  const expensesModal = searchParams?.get("expensesModal");
  const moveBudget = searchParams?.get("moveBudget");
  return (
    <Tabs
      value={selectedCycleId}
      onValueChange={updateCycleId}
      className="w-full space-y-4"
    >
      <div className="flex items-center gap-4">
        <BurgerMenu user={user} />
        <QuickMenu user={user} />
      </div>
      {hasCycles && (
        <TabsList className="border-b w-full justify-start px-2 overflow-x-auto overflow-y-hidden space-x-2">
          <MainTableHeader />
        </TabsList>
      )}

      {hasCycles && (
        <>
          <CycleTab />
          {/* <CycleChart /> */}
        </>
      )}
      <AddNewExpense
        categoryId={categoryId}
        monthly={Boolean(monthly)}
        open={expensesModal === "active"}
      />
      <MoveBudget
        categoryId={categoryId}
        monthly={Boolean(monthly)}
        open={moveBudget === "active"}
      />
    </Tabs>
  );
}

export default function MainTable({
  cycles,
  user,
}: {
  cycles:
    | {
        id: string;
        title: string;
      }[]
    | null;
  user: SelectUser | undefined;
}) {
  if (!user) return null;

  return (
    <CycleContext user={user} cycles={cycles}>
      <MainTableContent user={user} cycles={cycles} />
    </CycleContext>
  );
}
