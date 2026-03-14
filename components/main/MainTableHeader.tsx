"use client";
import CycleContextMenu from "@/components/contextMenus/CycleContextMenu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useCycleContext } from "./MainTable";

export default function MainTableHeader() {
  const { selectedCycleId, updateCycleId, cycles } = useCycleContext();

  useHotkeys(["meta+arrowright", "ctrl+arrowright"], () => {
    if (!cycles) return;
    const currentIndex = cycles.findIndex((c) => c.id === selectedCycleId);
    const nextIndex = currentIndex + 1 >= cycles.length ? 0 : currentIndex + 1;
    updateCycleId(cycles[nextIndex].id);
  });

  useHotkeys(["meta+arrowleft", "ctrl+arrowleft"], () => {
    if (!cycles) return;
    const currentIndex = cycles.findIndex((c) => c.id === selectedCycleId);
    const prevIndex = currentIndex - 1 < 0 ? cycles.length - 1 : currentIndex - 1;
    updateCycleId(cycles[prevIndex].id);
  });

  useEffect(() => {
    if (!cycles) return;
    const exists = cycles.some((c) => c.id === selectedCycleId);
    if (!exists && cycles.length > 0) {
      updateCycleId(cycles[0].id);
    }
  }, [cycles, selectedCycleId]);

  const selectedCycle = useMemo(
    () => cycles?.find((c) => c.id === selectedCycleId),
    [cycles, selectedCycleId]
  );

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <Select value={selectedCycleId} onValueChange={updateCycleId}>
        <SelectTrigger className="flex-1 min-w-0 h-10">
          <SelectValue placeholder="Select cycle" />
        </SelectTrigger>
        <SelectContent>
          {cycles?.map((cycle) => (
            <SelectItem key={cycle.id} value={cycle.id}>
              {cycle.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedCycle && (
        <CycleContextMenu cycle={selectedCycle}>
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CycleContextMenu>
      )}
    </div>
  );
}
