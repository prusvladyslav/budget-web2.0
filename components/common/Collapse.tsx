"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Props = {
  header: string;
  children: React.ReactNode;
};

export function Collapse({ header, children }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex justify-between w-full p-0 text-base"
        >
          {header}
          <ChevronsUpDown className="h-5 w-5" />
          <span className="sr-only">Toggle</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}
