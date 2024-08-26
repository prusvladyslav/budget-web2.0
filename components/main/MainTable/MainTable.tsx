"use client";
import { Tabs, TabsList } from "@/components/ui/tabs";
import MainTableHeader from "../MainTableHeader";
import { SelectCycle, SelectUser } from "@/db/schema";
import CycleTab from "../CycleTab";
import { CycleContext, useCycleContext } from "./useCycleContext";
import { BurgerMenu } from "@/components/common/BurgerMenu";
import QuickMenu from "../QuickMenu/QuickMenu";
import CycleChart from "../CycleChart/CycleChart";

function MainTableContent({
  user,
  cycles,
}: {
  user: SelectUser;
  cycles: SelectCycle[] | null;
}) {
  const { selectedCycleId, updateCycleId } = useCycleContext();
  const hasCycles = cycles && cycles.length > 0;
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
          <CycleChart />
        </>
      )}
    </Tabs>
  );
}

export default function MainTable({
  cycles,
  user,
}: {
  cycles: SelectCycle[] | null;
  user: SelectUser | undefined;
}) {
  if (!user) return null;

  return (
    <CycleContext user={user} cycles={cycles}>
      <MainTableContent user={user} cycles={cycles} />
    </CycleContext>
  );
}
