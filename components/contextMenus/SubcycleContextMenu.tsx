"use client";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SelectSubcycle } from "@/db/schema";
import { deleteSubcycle } from "@/app/actions";
import { toast } from "sonner";
import { Dialog } from "../ui/dialog";

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
          {/* <ContextMenuItem className="block">
            <DialogTrigger asChild>
              <p>
                Rename <span className="underline">{subcycle.title}</span>{" "}
                subcycle
              </p>
            </DialogTrigger>
          </ContextMenuItem> */}

          <ContextMenuItem className="block">
            {" "}
            <form
              action={async () => {
                await deleteSubcycle(subcycle.id);
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
      {/* <RenameCycle cycle={subcycle} /> */}
    </Dialog>
  );
}
