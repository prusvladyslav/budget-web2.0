"use client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>plus</title>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export function PlusButton({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      className={cn(className)}
      onClick={onClick}
      variant="ghost"
      size="icon"
    >
      <PlusIcon className="w-4 h-4" />
    </Button>
  );
}
