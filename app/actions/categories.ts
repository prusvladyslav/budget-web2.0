"use server";
import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
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
  categoryFromId: string[];
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
    db.query.categoryTable.findMany({
      where: inArray(categoryTable.id, data.categoryFromId),
      columns: {
        id: true,
        initialAmount: true,
      },
    }),
    db.query.categoryTable.findFirst({
      where: eq(categoryTable.id, data.categoryToId),
      columns: {
        id: true,
        initialAmount: true,
      },
    }),
  ]);

  if (!categoryFrom.length || !categoryTo) return null;

  await db
    .update(categoryTable)
    .set({
      initialAmount:
        categoryTo.initialAmount + data.amount * categoryFrom.length,
    })
    .where(eq(categoryTable.id, data.categoryToId));

  await Promise.all(
    categoryFrom.map((category) =>
      db
        .update(categoryTable)
        .set({
          initialAmount: category.initialAmount - data.amount,
        })
        .where(eq(categoryTable.id, category.id))
    )
  );
});
