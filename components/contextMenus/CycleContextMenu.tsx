"use client";
import { SelectCycle } from "@/db/schema";
import { deleteCycle } from "@/app/actions";
import { toast } from "sonner";
import { Dialog, DialogTrigger } from "../ui/dialog";
import RenameCycle from "../modals/RenameCycle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CycleContextMenu({
  children,
  cycle,
}: {
  children: React.ReactNode;
  cycle: SelectCycle;
}) {
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          {/* <DropdownMenuItem className="block">
            <DialogTrigger asChild>
              <p>
                Rename <span className="underline">{cycle.title}</span> cycle
              </p>
            </DialogTrigger>
          </DropdownMenuItem> */}

          <DropdownMenuItem className="block">
            {" "}
            <form
              action={async () => {
                await deleteCycle(cycle.id);
                toast.success("Cycle deleted successfully");
              }}
            >
              <button>
                Delete <span className="underline">{cycle.title}</span> cycle
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RenameCycle cycle={cycle} />
    </Dialog>
  );
}
