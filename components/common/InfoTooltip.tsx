import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

export function InfoTooltip({
  text,
  textClassname,
}: {
  text: string;
  textClassname?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info width={20} height={20} />
        </TooltipTrigger>
        <TooltipContent>
          <span className={cn("text-xs", textClassname)}>{text}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
