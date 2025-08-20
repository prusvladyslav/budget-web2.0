"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SkipBackIcon as Backspace } from "lucide-react";
import { Input } from "../ui/input";

interface MobileNumberKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onChangeInput: (value: string) => void;
  maxLength?: number;
  onDone?: () => void;
  className?: string;
}

export function MobileNumberKeyboard({
  value,
  onChange,
  onChangeInput,
  maxLength = 15,
  onDone,
  className = "",
}: MobileNumberKeyboardProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleKeyPress = (key: string) => {
    if (value.length >= maxLength) return;

    setActiveKey(key);
    onChange(value + key);

    // Reset active state after animation
    setTimeout(() => setActiveKey(null), 150);
  };

  const handleBackspace = () => {
    setActiveKey("backspace");
    onChange(value.slice(0, -1));

    // Reset active state after animation
    setTimeout(() => setActiveKey(null), 150);
  };

  const handleDone = () => {
    if (onDone) {
      onDone();
    }
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", ""],
  ];

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Display */}
      <Input
        className="w-full h-9 sm:h-10 text-base"
        type="number"
        placeholder="Expense amount"
        value={value}
        onChange={(e) => onChangeInput(e.target.value)}
      />

      {/* Number Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {keys.flat().map((key, index) =>
          key === "" ? (
            <div key={index} className="h-12" />
          ) : (
            <Button
              key={key + index}
              variant="outline"
              size="sm"
              type="button"
              className={`
                h-12 text-lg font-semibold transition-all duration-150 
                bg-background hover:bg-accent hover:text-accent-foreground
                active:scale-95 border
                ${
                  activeKey === key
                    ? "bg-accent text-accent-foreground scale-95"
                    : ""
                }
              `}
              onClick={() => handleKeyPress(key)}
              aria-label={`Number ${key}`}
            >
              {key}
            </Button>
          )
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          className={`
            h-10 flex-1 transition-all duration-150 
            bg-background hover:bg-destructive hover:text-destructive-foreground
            active:scale-95 border
            ${
              activeKey === "backspace"
                ? "bg-destructive text-destructive-foreground scale-95"
                : ""
            }
          `}
          onClick={handleBackspace}
          disabled={value.length === 0}
          aria-label="Backspace"
        >
          <Backspace className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
