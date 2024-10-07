"use client";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { SelectSubcycle } from "@/db/schema";
import { toast } from "sonner";
import { Dialog } from "../ui/dialog";
import { subcyclesActions } from "@/app/actions";

export default function SubcycleContextMenu({
  children,
  subcycle,
}: {
  children: React.ReactNode;
  subcycle: SelectSubcycle;
}) {
  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem className="block">
            {" "}
            <form
              action={async () => {
                await subcyclesActions.deleteSubcycle(subcycle.id);
                toast.success("subcycle deleted successfully");
              }}
            >
              <button>
                Delete <span className="underline">{subcycle.title}</span>{" "}
                subcycle
              </button>
            </form>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </Dialog>
  );
}
