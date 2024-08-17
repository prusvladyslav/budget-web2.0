"use client";
import CycleContextMenu from "@/components/contextMenus/CycleContextMenu";
import AddNewCycleOrSubcycle from "../modals/AddNewCycle";
import { TabsTrigger } from "../ui/tabs";
import { SelectCycle } from "@/db/schema";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ChevronDown } from "lucide-react";
import { PlusButton } from "../common/PlusButton";

export default function MainTableHeader({
  cycles,
  selectedCycle,
  updateSelectedCycleValue,
}: {
  cycles: SelectCycle[] | null;
  selectedCycle: string;
  updateSelectedCycleValue: (value: string) => void;
}) {
  useHotkeys(["meta+arrowright", "ctrl+arrowright"], (evt) => {
    if (!cycles) return;

    const currentIndex = cycles.findIndex((c) => c.id === selectedCycle);

    const nextIndex = currentIndex + 1 >= cycles.length ? 0 : currentIndex + 1;
    return updateSelectedCycleValue(cycles[nextIndex].id);
  });

  useHotkeys(["meta+arrowleft", "ctrl+arrowleft"], (evt) => {
    if (!cycles) return;

    const currentIndex = cycles.findIndex((c) => c.id === selectedCycle);
    const prevIndex =
      currentIndex - 1 < 0 ? cycles.length - 1 : currentIndex - 1;
    return updateSelectedCycleValue(cycles[prevIndex].id);
  });

  useEffect(() => {
    if (!cycles) return;

    const selectedCycleExists = cycles.some(
      (cycle) => cycle.id === selectedCycle
    );
    if (!selectedCycleExists && cycles.length > 0) {
      updateSelectedCycleValue(cycles[0].id);
    }
  }, [cycles, selectedCycle]);

  return (
    <>
      <AddNewCycleOrSubcycle triggerElement={<PlusButton className="" />} />
      {cycles?.map((cycle) => (
        <TabsTrigger value={cycle.id} className="space-x-2">
          <span>{cycle.title}</span>
          <CycleContextMenu key={cycle.id} cycle={cycle}>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </CycleContextMenu>
        </TabsTrigger>
      ))}
    </>
  );
}
