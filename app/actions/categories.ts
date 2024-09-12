"use server";
import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { cache } from "react";
export type CategoryType = "weekly" | "monthly" | "all";

export const getCategoriesByCycleId = cache(
  async ({
    cycleId,
    categoryType,
  }: {
    cycleId: string;
    categoryType: CategoryType;
  }) => {
    const { userId } = auth();

    if (!userId) return null;

    if (categoryType === "all") {
      const categories = await db.query.categoryTable.findMany({
        where: eq(categoryTable.cycleId, cycleId),
      });
      return categories;
    }

    return await db.query.categoryTable.findMany({
      where: and(
        eq(categoryTable.cycleId, cycleId),
        eq(categoryTable.weekly, categoryType === "weekly")
      ),
    });
  }
);

export const getAllCategories = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.userId, userId),
  });

  return categories;
});
type TMoveBudget = {
  categoryFromId: string;
  categoryToId: string;
  amount: number;
};
export const moveBudget = cache(async (data: TMoveBudget) => {
  const { userId } = auth();

  if (!userId) return null;

  if (
    Object.keys(data as Record<string, unknown>).some(
      (key) => !(data as Record<string, unknown>)[key]
    )
  )
    return console.error("Some data is missing");

  const [categoryFrom, categoryTo] = await Promise.all([
    db.query.categoryTable.findFirst({
      where: eq(categoryTable.id, data.categoryFromId),
    }),
    db.query.categoryTable.findFirst({
      where: eq(categoryTable.id, data.categoryToId),
    }),
  ]);

  if (!categoryFrom || !categoryTo) return null;

  await Promise.all([
    db
      .update(categoryTable)
      .set({
        initialAmount: categoryFrom.initialAmount - data.amount,
      })
      .where(eq(categoryTable.id, data.categoryFromId)),
    db
      .update(categoryTable)
      .set({
        initialAmount: categoryTo.initialAmount + data.amount,
      })
      .where(eq(categoryTable.id, data.categoryToId)),
  ]);
});
