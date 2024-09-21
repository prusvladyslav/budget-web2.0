import * as z from "zod";

export const formSchemaWeekly = z.object({
  date: z.date(),
  cycleId: z.string().min(1, "Please select a cycle"),
  subcycleId: z.string().min(1, "Please select a subcycle"),
  categoryId: z.string().min(1, "Please select a category"),
  comment: z.string().optional(),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Expense amount must be greater than 0")
  ),
  label: z.string().optional(),
});

export const formSchemaMonthly = z.object({
  date: z.date(),
  cycleId: z.string().min(1, "Please select a cycle"),
  categoryId: z.string().min(1, "Please select a category"),
  comment: z.string().optional(),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Expense amount must be greater than 0")
  ),
  label: z.string().optional(),
});

export type FormData = z.infer<
  typeof formSchemaWeekly | typeof formSchemaMonthly
>;
