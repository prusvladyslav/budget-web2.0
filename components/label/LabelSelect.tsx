import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { defaultOptions, TLabelName } from "./const";
import { useGetIcon } from "./utils";

type Props = {
  placeholder?: string;
  className?: string;
  options?: Array<{ label: string; value: TLabelName }>;
  setValue: (value: string) => void;
  defaultValue?: string | null;
  disabled: boolean;
  value?: string;
};

export const LabelSelect = ({
  placeholder = "Select label",
  setValue,
  disabled,
  value,
  options = defaultOptions,
  defaultValue,
  className,
}: Props) => {
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
          ? options.map(({ label, value }) => (
              <SelectItem value={value} key={value}>
                <div className="flex items-center gap-2">
                  {useGetIcon(value)}
                  {label}
                </div>
              </SelectItem>
            ))
          : null}
      </SelectContent>
    </Select>
  );
};
