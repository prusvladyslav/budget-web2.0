"use client";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCycle } from "@/app/actions";
import { toast } from "sonner";
import { SelectCycle } from "@/db/schema";
import TwoDatesPicker from "../common/TwoDatesPicker";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { formatDateRange, parseDateRange } from "@/lib/utils";

export default function RenameCycle({ cycle }: { cycle: SelectCycle }) {
  const parsedRange = parseDateRange(cycle.title);

  const from = parsedRange?.from;

  const to = parsedRange?.to;

  const [date, setDate] = useState<DateRange | undefined>({
    from,
    to,
  });
  return (
    <DialogContent className="sm:max-w-[425px]">
      <form
        action={async () => {
          if (!date) return toast.error("Date is required");

          const title = formatDateRange(date);

          const cycleId = await updateCycle(cycle.id, title);

          if (cycleId) {
            return toast.success("Cycle updated successfully");
          }

          toast.error("Error updating cycle");
        }}
      >
        <DialogHeader>
          <DialogTitle>Rename {cycle.title} cycle</DialogTitle>
        </DialogHeader>
        <div className="my-4">
          <TwoDatesPicker date={date} setDate={setDate} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit">Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
