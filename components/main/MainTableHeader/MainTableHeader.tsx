"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useCycleContext } from "../MainTable";
import AddNewCycle from "@/components/modals/AddNewCycle";
import { usersActions, cyclesActions } from "@/app/actions";
import { toast } from "sonner";

const ADD_NEW_VALUE = "__add_new__";

type DefaultCategory = { title: string; initialAmount: number | undefined; weekly: boolean };

export function MainTableHeader() {
  const { selectedCycleId, updateCycleId, cycles } = useCycleContext();
  const [addCycleOpen, setAddCycleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [defaultCategories, setDefaultCategories] = useState<DefaultCategory[] | null>(null);

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

  const handleValueChange = async (val: string) => {
    if (val === ADD_NEW_VALUE) {
      const cats = await usersActions.getDefaultCategories();
      setDefaultCategories(cats);
      setAddCycleOpen(true);
      return;
    }
    updateCycleId(val);
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Select value={selectedCycleId} onValueChange={handleValueChange}>
          <SelectTrigger className="flex-1 min-w-0 h-10">
            <SelectValue placeholder="Select cycle" />
          </SelectTrigger>
          <SelectContent>
            {cycles?.map((cycle) => (
              <SelectItem key={cycle.id} value={cycle.id}>
                {cycle.title}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value={ADD_NEW_VALUE}>
              <span className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add new cycle
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {selectedCycle && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {addCycleOpen && defaultCategories && (
        <AddNewCycle
          open={addCycleOpen}
          onOpenChange={(open) => {
            setAddCycleOpen(open);
            if (!open) setDefaultCategories(null);
          }}
          defaultCategories={defaultCategories}
        />
      )}

      {selectedCycle && (
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCycle.title}</DialogTitle>
            </DialogHeader>
            <form
              action={async () => {
                await cyclesActions.deleteCycle(selectedCycle.id);
                toast.success("Cycle deleted successfully");
                setSettingsOpen(false);
              }}
            >
              <Button variant="destructive" type="submit" className="w-full">
                Delete cycle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
