"use client";
import { toast } from "sonner";
import { Dialog } from "../ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cyclesActions } from "@/app/actions";

export default function CycleContextMenu({
  children,
  cycle,
}: {
  children: React.ReactNode;
  cycle: { id: string; title: string };
}) {
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuItem className="block">
            {" "}
            <form
              action={async () => {
                await cyclesActions.deleteCycle(cycle.id);
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
    </Dialog>
  );
}
