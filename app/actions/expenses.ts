"use server";
import { db } from "@/db";
import { expenseTable, InsertExpense } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import * as z from "zod";
import { getAllCategories } from "./categories";
import { addToMainAccount, deductFromMainAccount } from "./vault";

const ExpenseSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
  amount: z.number().min(1, "Expense amount must be greater than 0"),
  date: z.string().min(1, "Invalid date"),
  comment: z.string().optional(),
  categoryId: z.string().min(1, "Invalid category ID"),
  cycleId: z.string().min(1, "Invalid cycle ID"),
  subcycleId: z.string().min(1, "Invalid subcycle ID"),
});

export const getExpensesByCategoryIds = cache(async (categoryIds: string[]) => {
  const { userId } = auth();

  if (!userId) return null;

  if (!categoryIds) return null;

  const expenses = await db.query.expenseTable.findMany({
    where: inArray(expenseTable.categoryId, categoryIds),
  });

  return expenses;
});

export const addExpense = cache(async (data: Omit<InsertExpense, "userId">) => {
  const { userId } = auth();

  if (!userId) return null;

  const result = ExpenseSchema.omit({ id: true, subcycleId: true }).safeParse(
    data
  );

  if (!result.success) {
    return console.error(result.error.issues);
  }

  await db.insert(expenseTable).values({ ...data, userId });
  deductFromMainAccount(data.amount);
  revalidatePath("/");
});

export const getAllExpenses = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  const expenses = await db.query.expenseTable.findMany({
    where: eq(expenseTable.userId, userId),
  });

  return expenses;
});

export const getAllExpensesTable = cache(async (cycleId?: string) => {
  const { userId } = auth();

  if (!userId) return null;

  const expenses = await db.query.expenseTable.findMany({
    where: cycleId
      ? and(eq(expenseTable.userId, userId), eq(expenseTable.cycleId, cycleId))
      : eq(expenseTable.userId, userId),
    orderBy: [desc(expenseTable.date)],
  });

  const categories = await getAllCategories();

  if (!categories) return null;

  const mappedExpenses = expenses.map((expense) => ({
    ...expense,
    category:
      categories.find((category) => category.id === expense.categoryId)
        ?.title || "unkown category",
    date: formatDate(new Date(expense.date)),
  }));
  return mappedExpenses;
});

export const deleteExpenses = cache(async (ids: string[]) => {
  const { userId } = auth();

  if (!userId) return null;

  if (!ids.some((id) => !!id || typeof id !== "string"))
    return console.error("something went wrong with id deletion", ids);

  const expenses = await db
    .delete(expenseTable)
    .where(inArray(expenseTable.id, ids))
    .returning({ id: expenseTable.id, amount: expenseTable.amount });

  if (!expenses) return null;

  const totalAmount = expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );

  addToMainAccount(totalAmount);

  revalidatePath("/expenses");
});
