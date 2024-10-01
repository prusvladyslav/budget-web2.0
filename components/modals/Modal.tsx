"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogTitle: string;
  children: React.ReactNode;
  triggerElement?: React.ReactNode;
};
export default function Modal({
  open,
  onOpenChange,
  dialogTitle,
  children,
  triggerElement,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(open) => onOpenChange(open)}>
      {triggerElement && (
        <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      )}
      <DialogContent className="max-w-[95vw] sm:max-w-lg p-0">
        <ScrollArea className="max-h-[88vh] sm:max-h-[95vh]">
          <div className="p-3 sm:p-6">
            <DialogHeader className="mb-3 sm:mb-4">
              <DialogTitle className="text-base sm:text-xl">
                {dialogTitle}
              </DialogTitle>
            </DialogHeader>
            {children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
