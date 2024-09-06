"use server";

import { db } from "@/db";
import {
  categoryTable,
  cycleTable,
  InsertCategory,
  subsycleTable,
} from "@/db/schema";
import { createWeeksArray, formatDateRange } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { DateRange } from "react-day-picker";
import * as z from "zod";

const CycleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  cycleId: z.string().min(1, "Invalid cycle ID"),
});

export const getCycles = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  const cycles = await db.query.cycleTable.findMany({
    where: eq(cycleTable.userId, userId),
  });
  return cycles;
});

export type Category = Omit<InsertCategory, "cycleId">;

type CreateCycle = {
  date: DateRange;
  categories: Array<Omit<Category, "userId">>;
};
export const createCycle = cache(async ({ date, categories }: CreateCycle) => {
  const { userId } = auth();

  if (!userId) return null;

  if (!date || !date.from || !date.to) return null;

  const cycleTitle = formatDateRange(date);

  const cycleValidationResult = CycleSchema.pick({ title: true }).safeParse({
    title: cycleTitle,
  });

  if (!cycleValidationResult.success) {
    return console.error(cycleValidationResult.error.issues);
  }

  const existingCycle = await db.query.cycleTable.findFirst({
    where: and(eq(cycleTable.title, cycleTitle), eq(cycleTable.userId, userId)),
  });

  if (existingCycle) {
    throw new Error("A cycle with this title already exists.");
  }

  const newCycle = await db
    .insert(cycleTable)
    .values({
      userId,
      title: cycleTitle,
    })
    .returning({ id: cycleTable.id });

  const newCycleId = newCycle[0].id;

  if (newCycleId) {
    // Create subcycles for the new cycle
    const weeksArr = createWeeksArray({ dateRange: date });

    const subcyclesArray = weeksArr.map((week) => ({
      title: formatDateRange(week),
      cycleId: newCycleId,
      userId,
    }));

    const newSubcyclesIds = await db
      .insert(subsycleTable)
      .values(subcyclesArray)
      .returning({ id: subsycleTable.id });

    // create categories for the new cycle
    const categoriesArray = categories.map((category) => ({
      ...category,
      cycleId: newCycleId,
      userId,
    }));
    await db.insert(categoryTable).values(categoriesArray);
  }
  revalidatePath("/");
});

export const updateCycleId = cache(async (cycleId: string, title: string) => {
  const { userId } = auth();

  if (!userId) return null;

  const result = CycleSchema.safeParse({ title, cycleId });

  if (!result.success) {
    return console.error(result.error.issues);
  }

  await db
    .update(cycleTable)
    .set({
      title,
    })
    .where(eq(cycleTable.id, cycleId));
  revalidatePath("/");
  return cycleId;
});

export const deleteCycle = cache(async (cycleId: string) => {
  const { userId } = auth();

  if (!userId) return null;

  const result = CycleSchema.pick({ cycleId: true }).safeParse({ cycleId });

  if (!result.success) {
    return console.error(result.error.issues);
  }

  await db.delete(cycleTable).where(eq(cycleTable.id, cycleId));
  revalidatePath("/");
});
