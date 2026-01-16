const labelsNames = [
  "eating out",
  "food delivery",
  "groceries",
  "transport",
  "entertainment",
  "shopping",
  "clothing",
  "subscriptions",
  "education",
  "drugs",
  "health",
  "utility bills",
  "other",
] as const;

export type TLabelName = (typeof labelsNames)[number];

export const defaultOptions = labelsNames.map((label) => ({
  label: label.charAt(0).toUpperCase() + label.slice(1),
  value: label,
}));
