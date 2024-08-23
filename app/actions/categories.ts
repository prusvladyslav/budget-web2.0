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
