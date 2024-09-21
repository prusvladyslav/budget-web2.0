const labelsNames = [
  "groceries",
  "restaurant",
  "transport",
  "entertainment",
  "shopping",
  "food delivery",
  "clothing",
  "other",
] as const;

export type TLabelName = (typeof labelsNames)[number];

export const defaultOptions = labelsNames.map((label) => ({
  label: label.charAt(0).toUpperCase() + label.slice(1),
  value: label,
}));
