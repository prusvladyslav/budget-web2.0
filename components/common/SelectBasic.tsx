import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  placeholder: string;
  className?: string;
  options?: Array<{ label: string; value: string }>;
  setValue: (value: string) => void;
  defaultValue?: string | null;
  disabled: boolean;
  value?: string;
};

function SelectBasic({
  placeholder,
  className,
  options,
  setValue,
  defaultValue,
  disabled,
  value,
}: Props) {
  return (
    <Select
      value={value ?? undefined}
      defaultValue={defaultValue ?? undefined}
      disabled={!options?.length || disabled}
      onValueChange={setValue}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options
          ? options.map((option) => (
              <SelectItem value={option.value} key={option.value}>
                {option.label}
              </SelectItem>
            ))
          : null}
      </SelectContent>
    </Select>
  );
}
export default React.memo(SelectBasic);
