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
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useCycleContext } from "../MainTable";
import AddNewCycle from "@/components/modals/AddNewCycle";
import { usersActions, cyclesActions } from "@/app/actions";
import { toast } from "sonner";

const ADD_NEW_VALUE = "__add_new__";

type DefaultCategory = {
  title: string;
  initialAmount: number | undefined;
  weekly: boolean;
};

export function MainTableHeader({ children }: { children?: ReactNode }) {
  const { selectedCycleId, updateCycleId, cycles } = useCycleContext();
  const [addCycleOpen, setAddCycleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [defaultCategories, setDefaultCategories] = useState<
    DefaultCategory[] | null
  >(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const hasCycles = !!cycles?.length;

  useHotkeys(["meta+arrowright", "ctrl+arrowright"], () => {
    if (!cycles?.length) return;
    const currentIndex = cycles.findIndex((c) => c.id === selectedCycleId);
    const nextIndex = currentIndex + 1 >= cycles.length ? 0 : currentIndex + 1;
    updateCycleId(cycles[nextIndex].id);
  });

  useHotkeys(["meta+arrowleft", "ctrl+arrowleft"], () => {
    if (!cycles?.length) return;
    const currentIndex = cycles.findIndex((c) => c.id === selectedCycleId);
    const prevIndex =
      currentIndex - 1 < 0 ? cycles.length - 1 : currentIndex - 1;
    updateCycleId(cycles[prevIndex].id);
  });

  useEffect(() => {
    if (!cycles) return;
    const exists = cycles.some((c) => c.id === selectedCycleId);
    const nextCycleId = cycles[0]?.id ?? "";
    if (!exists && selectedCycleId !== nextCycleId) {
      updateCycleId(nextCycleId);
    }
  }, [cycles, selectedCycleId, updateCycleId]);

  const selectedCycle = useMemo(
    () => cycles?.find((c) => c.id === selectedCycleId),
    [cycles, selectedCycleId],
  );

  const openAddCycle = async () => {
    if (loadingCategories) return;
    setLoadingCategories(true);
    try {
      const cats = await usersActions.getDefaultCategories();
      setDefaultCategories(cats);
      setAddCycleOpen(true);
    } catch {
      toast.error("Could not load categories. Please try again.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleValueChange = async (val: string) => {
    if (val === ADD_NEW_VALUE) return openAddCycle();
    updateCycleId(val);
  };

  return (
    <>
      <div className="flex items-center gap-2 py-2">
        {children}
        {hasCycles && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Select
              value={selectedCycleId}
              onValueChange={handleValueChange}
              disabled={loadingCategories}
            >
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
        )}
      </div>

      {!hasCycles && (
        <section
          className="mt-6 rounded-lg border border-dashed p-6 sm:p-10 text-center"
          aria-labelledby="empty-cycles-title"
        >
          <h1 id="empty-cycles-title" className="text-lg font-semibold">
            No cycles yet
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a cycle to set your budget and start tracking expenses.
          </p>
          <Button
            className="mt-4"
            onClick={openAddCycle}
            disabled={loadingCategories}
          >
            <Plus className="mr-2 h-4 w-4" />
            {loadingCategories ? "Loading…" : "Create cycle"}
          </Button>
        </section>
      )}

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
