"use server";
import { db } from "@/db";
import { categoryTable, expenseTable, cycleTable, subsycleTable, monthlyReportTable, type SelectMonthlyReport } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";

export type ExpenseReportRow = {
  date: string;
  amount: number;
  category: string;
  subcycle: string;
  label: string | null;
  comment: string | null;
};

export type CycleReportData = {
  cycleName: string;
  expenses: ExpenseReportRow[];
};

export const getCycleReportData = cache(async (cycleId: string): Promise<CycleReportData | null> => {
  const { userId } = auth();

  if (!userId) return null;

  // Get cycle info
  const cycle = await db.query.cycleTable.findFirst({
    where: and(eq(cycleTable.id, cycleId), eq(cycleTable.userId, userId)),
  });

  if (!cycle) return null;

  // Get all categories for this cycle
  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.cycleId, cycleId),
  });

  // Get all subcycles for this cycle
  const subcycles = await db.query.subsycleTable.findMany({
    where: eq(subsycleTable.cycleId, cycleId),
  });

  // Get all expenses for this cycle
  const expenses = await db.query.expenseTable.findMany({
    where: and(eq(expenseTable.cycleId, cycleId), eq(expenseTable.userId, userId)),
    orderBy: [desc(expenseTable.date)],
  });

  // Create lookup maps
  const categoryMap = new Map(categories.map((c) => [c.id, c.title]));
  const subcycleMap = new Map(subcycles.map((s) => [s.id, s.title]));

  // Map expenses to report rows
  const reportRows: ExpenseReportRow[] = expenses.map((expense) => ({
    date: expense.date,
    amount: expense.amount,
    category: categoryMap.get(expense.categoryId) || "Unknown",
    subcycle: expense.subcycleId ? subcycleMap.get(expense.subcycleId) || "Monthly" : "Monthly",
    label: expense.label,
    comment: expense.comment,
  }));

  return {
    cycleName: cycle.title,
    expenses: reportRows,
  };
});

type CreateMonthlyReportInput = {
  cycleId: string;
  income: number;
  tax: number;
  rent: number;
  savingsShortTerm: number;
  savingsLongTerm: number;
  invest: number;
  dayToDay: number;
  leftover: number;
};

export const createMonthlyReport = async (
  input: CreateMonthlyReportInput
): Promise<void> => {
  const { userId } = auth();
  if (!userId) return;

  await db.insert(monthlyReportTable).values({
    cycleId: input.cycleId,
    userId,
    income: Math.round(input.income),
    tax: Math.round(input.tax),
    rent: Math.round(input.rent),
    savingsShortTerm: Math.round(input.savingsShortTerm),
    savingsLongTerm: Math.round(input.savingsLongTerm),
    invest: Math.round(input.invest),
    dayToDay: Math.round(input.dayToDay),
    leftover: Math.round(input.leftover),
  });
};

type UpdateMonthlyReportInput = CreateMonthlyReportInput & {
  reportId: string;
};

export const updateMonthlyReport = async (
  input: UpdateMonthlyReportInput
): Promise<void> => {
  const { userId } = auth();
  if (!userId) return;

  await db
    .update(monthlyReportTable)
    .set({
      cycleId: input.cycleId,
      income: Math.round(input.income),
      tax: Math.round(input.tax),
      rent: Math.round(input.rent),
      savingsShortTerm: Math.round(input.savingsShortTerm),
      savingsLongTerm: Math.round(input.savingsLongTerm),
      invest: Math.round(input.invest),
      dayToDay: Math.round(input.dayToDay),
      leftover: Math.round(input.leftover),
    })
    .where(
      and(
        eq(monthlyReportTable.id, input.reportId),
        eq(monthlyReportTable.userId, userId)
      )
    );

  revalidatePath("/reports");
};

export type MonthlyReportWithCycle = SelectMonthlyReport & { cycleTitle: string };

export const getMonthlyReports = cache(
  async (): Promise<MonthlyReportWithCycle[]> => {
    const { userId } = auth();
    if (!userId) return [];

    const reports = await db.query.monthlyReportTable.findMany({
      where: eq(monthlyReportTable.userId, userId),
      with: { cycle: { columns: { title: true } } },
      orderBy: [desc(monthlyReportTable.createdAt)],
    });

    return reports.map((r) => ({ ...r, cycleTitle: r.cycle.title }));
  }
);
