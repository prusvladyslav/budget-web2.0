"use client";
import CycleContextMenu from "@/components/contextMenus/CycleContextMenu";
import { TabsTrigger } from "../ui/tabs";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ChevronDown } from "lucide-react";
import { useCycleContext } from "./MainTable";

export default function MainTableHeader() {
  const { selectedCycleId, updateCycleId, cycles } = useCycleContext();

  useHotkeys(["meta+arrowright", "ctrl+arrowright"], (evt) => {
    if (!cycles) return;

    const currentIndex = cycles.findIndex((c) => c.id === selectedCycleId);

    const nextIndex = currentIndex + 1 >= cycles.length ? 0 : currentIndex + 1;
    return updateCycleId(cycles[nextIndex].id);
  });

  useHotkeys(["meta+arrowleft", "ctrl+arrowleft"], (evt) => {
    if (!cycles) return;

    const currentIndex = cycles.findIndex((c) => c.id === selectedCycleId);
    const prevIndex =
      currentIndex - 1 < 0 ? cycles.length - 1 : currentIndex - 1;
    return updateCycleId(cycles[prevIndex].id);
  });

  useEffect(() => {
    if (!cycles) return;

    const selectedCycleExists = cycles.some(
      (cycle) => cycle.id === selectedCycleId
    );
    if (!selectedCycleExists && cycles.length > 0) {
      updateCycleId(cycles[0].id);
    }
  }, [cycles, selectedCycleId]);

  return (
    <div className="space-x-2 flex">
      {cycles?.map((cycle) => (
        <TabsTrigger
          key={cycle.id}
          value={cycle.id}
          className="space-x-2 shadow-md border"
        >
          <>
            <span onClick={(e) => e.preventDefault()}>{cycle.title}</span>
            <CycleContextMenu key={cycle.id} cycle={cycle}>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </CycleContextMenu>
          </>
        </TabsTrigger>
      ))}
    </div>
  );
}
