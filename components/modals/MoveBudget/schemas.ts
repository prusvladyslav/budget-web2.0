import * as z from "zod";

export const formSchemaWeekly = z.object({
  cycleId: z.string().min(1, "Please select a cycle"),
  subcycleFromId: z.string().min(1, "Please select a subcycle from"),
  categoryFromId: z.string().min(1, "Please select a category from"),
  subcycleToId: z.string().min(1, "Please select a subcycle to"),
  categoryToId: z.string().min(1, "Please select a category to"),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Expense amount must be greater than 0")
  ),
});

export const formSchemaMonthly = z.object({
  cycleId: z.string().min(1, "Please select a cycle"),
  categoryFromId: z.string().min(1, "Please select a category from"),
  categoryToId: z.string().min(1, "Please select a category to"),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Expense amount must be greater than 0")
  ),
});

export type FormData = z.infer<
  typeof formSchemaWeekly | typeof formSchemaMonthly
>;
