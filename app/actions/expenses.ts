"use server";
import { db } from "@/db";
import { expenseTable, subsycleTable, type InsertExpense } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import * as z from "zod";
import { getAllCategories } from "./categories";
import {
  addToMainAccount,
  deductFromMainAccount,
  getMainAccount,
} from "./vault";

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

export const addQuickExpenses = cache(
  async (newBalance: number, cycleId: string) => {
    const { userId } = auth();

    if (!userId) return null;

    const currentBalance = (await getMainAccount())?.amount || 0;

    const totalValue = currentBalance - newBalance;

    const preparedSubcycles = db.query.subsycleTable
      .findMany({
        where: eq(subsycleTable.cycleId, sql.placeholder("cycleId")),
        columns: {
          id: true,
          title: true,
        },
        with: {
          categories: {
            columns: {
              id: true,
              initialAmount: true,
              title: true,
            },
            with: {
              expenses: {
                columns: {
                  amount: true,
                },
              },
            },
          },
        },
      })
      .prepare();

    const subcycles = await preparedSubcycles.execute({ cycleId: cycleId });

    const mappedSubcycles = subcycles.map((subcycle) => {
      return {
        ...subcycle,
        categories: subcycle.categories.map((category) => {
          return {
            ...category,
            currentAmount:
              category.initialAmount -
              category.expenses.reduce((acc, item) => acc + item.amount, 0),
          };
        }),
      };
    });

    let balanceLeft = totalValue;

    const expenses = [];

    for (const subcycle of mappedSubcycles) {
      for (const category of subcycle.categories) {
        if (balanceLeft > 0 && category.currentAmount > 0) {
          const deductedAmount = Math.min(balanceLeft, category.currentAmount);
          balanceLeft -= deductedAmount;
          const expense = {
            date: new Date().toISOString(),
            cycleId: cycleId,
            subcycleId: subcycle.id,
            categoryId: category.id,
            amount: deductedAmount,
            label: "",
            comment: "",
            userId,
          };
          expenses.push(expense);
        }
      }
    }

    if (balanceLeft > 0) {
      return { error: "Could not add quick expenses" };
    }

    await db.insert(expenseTable).values(expenses);

    deductFromMainAccount(totalValue);
    revalidatePath("/");
  }
);
