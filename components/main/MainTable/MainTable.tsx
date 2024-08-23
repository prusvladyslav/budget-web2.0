"use client";
import { Tabs, TabsList } from "@/components/ui/tabs";
import MainTableHeader from "../MainTableHeader";
import { SelectCycle, SelectUser } from "@/db/schema";
import CycleTab from "../CycleTab";
import AddNewExpense from "@/components/modals/AddNewExpense";
import { MainTableProvider, useCycleContext } from "./useCycleContext";

function MainTableContent({ cycles }: { cycles: SelectCycle[] | null }) {
  const { selectedCycle, updateCycle } = useCycleContext();

  return (
    <Tabs
      value={selectedCycle}
      onValueChange={updateCycle}
      className="w-full space-y-4"
    >
      <div className="flex items-center space-x-4">
        <AddNewExpense cycles={cycles} />
        <TabsList className="border-b w-full justify-start px-4 overflow-x-auto overflow-y-hidden space-x-2">
          <MainTableHeader cycles={cycles} />
        </TabsList>
      </div>

      <CycleTab cycles={cycles} />
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
    <MainTableProvider user={user} cycles={cycles}>
      <MainTableContent cycles={cycles} />
    </MainTableProvider>
  );
}
