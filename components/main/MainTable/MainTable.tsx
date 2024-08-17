"use client";
import { Tabs, TabsList } from "@/components/ui/tabs";
import MainTableHeader from "../MainTableHeader";
import { SelectCycle, SelectUser } from "@/db/schema";
import { useDebouncedUserUpdate, useCycleState } from "./useMainTable";
import CycleTab from "../CycleTab";
import { Suspense } from "react";

export default function MainTable({
  cycles,
  user,
}: {
  cycles: SelectCycle[] | null;
  user: SelectUser | undefined;
}) {
  if (!user) return null;

  const debouncedUpdateUserCycle = useDebouncedUserUpdate("lastOpenedCycleId");

  const { selectedCycle, updateSelectedCycleValue } = useCycleState(
    user.lastOpenedCycleId || cycles?.[0]?.id || "",
    debouncedUpdateUserCycle
  );

  return (
    <Tabs
      value={selectedCycle}
      onValueChange={updateSelectedCycleValue}
      className="w-full"
    >
      <TabsList className="border-b w-full justify-start px-4 overflow-x-auto overflow-y-hidden space-x-2">
        <MainTableHeader
          updateSelectedCycleValue={updateSelectedCycleValue}
          selectedCycle={selectedCycle}
          cycles={cycles}
        />
      </TabsList>
      {cycles?.map((cycle) => (
        <CycleTab user={user} cycle={cycle} />
      ))}
    </Tabs>
  );
}
