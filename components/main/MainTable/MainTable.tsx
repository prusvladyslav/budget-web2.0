"use client";
import { Tabs, TabsList } from "@/components/ui/tabs";
import MainTableHeader from "../MainTableHeader";
import { SelectCycle, SelectUser } from "@/db/schema";
import CycleTab from "../CycleTab";
import { CycleContext, useCycleContext } from "./useCycleContext";
import { BurgerMenu } from "@/components/common/BurgerMenu";
import QuickMenu from "../QuickMenu/QuickMenu";

function MainTableContent({
  cycles,
  user,
}: {
  cycles: SelectCycle[] | null;
  user: SelectUser;
}) {
  const { selectedCycleId, updateCycleId } = useCycleContext();

  return (
    <Tabs
      value={selectedCycleId}
      onValueChange={updateCycleId}
      className="w-full space-y-4"
    >
      <div className="flex items-center space-x-4">
        <BurgerMenu user={user} />
        <TabsList className="border-b w-full justify-start px-4 overflow-x-auto overflow-y-hidden space-x-2">
          <MainTableHeader />
        </TabsList>
      </div>

      <CycleTab />
      {/* <QuickMenu /> */}
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
