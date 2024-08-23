"use client";
import CycleContextMenu from "@/components/contextMenus/CycleContextMenu";
import AddNewCycle from "../modals/AddNewCycle";
import { TabsTrigger } from "../ui/tabs";
import { SelectCycle } from "@/db/schema";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ChevronDown } from "lucide-react";
import { PlusButton } from "../common/PlusButton";
import { useCycleContext } from "./MainTable";

export default function MainTableHeader({
  cycles,
}: {
  cycles: SelectCycle[] | null;
}) {
  const { selectedCycle, updateCycle } = useCycleContext();

  useHotkeys(["meta+arrowright", "ctrl+arrowright"], (evt) => {
    if (!cycles) return;

    const currentIndex = cycles.findIndex((c) => c.id === selectedCycle);

    const nextIndex = currentIndex + 1 >= cycles.length ? 0 : currentIndex + 1;
    return updateCycle(cycles[nextIndex].id);
  });

  useHotkeys(["meta+arrowleft", "ctrl+arrowleft"], (evt) => {
    if (!cycles) return;

    const currentIndex = cycles.findIndex((c) => c.id === selectedCycle);
    const prevIndex =
      currentIndex - 1 < 0 ? cycles.length - 1 : currentIndex - 1;
    return updateCycle(cycles[prevIndex].id);
  });

  useEffect(() => {
    if (!cycles) return;

    const selectedCycleExists = cycles.some(
      (cycle) => cycle.id === selectedCycle
    );
    if (!selectedCycleExists && cycles.length > 0) {
      updateCycle(cycles[0].id);
    }
  }, [cycles, selectedCycle]);

  return (
    <>
      <AddNewCycle triggerElement={<PlusButton className="" />} />
      {cycles?.map((cycle) => (
        <TabsTrigger key={cycle.id} value={cycle.id} className="space-x-2">
          <span onClick={(e) => e.preventDefault()}>{cycle.title}</span>
          <CycleContextMenu key={cycle.id} cycle={cycle}>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </CycleContextMenu>
        </TabsTrigger>
      ))}
    </>
  );
}
