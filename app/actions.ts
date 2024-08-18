"use server";

import { db } from "@/db";
import {
  categoryTable,
  cycleTable,
  expenseTable,
  InsertCategory,
  subsycleTable,
  usersTable,
} from "@/db/schema";
import { createWeeksArray, formatDateRange } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { DateRange } from "react-day-picker";
import * as z from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  id: z.string().min(1, "Invalid user ID"),
});

const UserSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

const CycleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  cycleId: z.string().min(1, "Invalid cycle ID"),
});

const SubcycleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  cycleId: z.string().min(1, "Invalid cycle ID"),
  subcycleId: z.string().min(1, "Invalid subcycle ID"),
});

export const getUser = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });
  return user;
});

export const createUser = cache(async (name: string, id: string) => {
  const result = CreateUserSchema.safeParse({ name, id });
  if (!result.success) {
    return console.error(result.error.issues);
  }
  revalidatePath("/");
  revalidatePath("/", "layout");
  return await db
    .insert(usersTable)
    .values({
      name,
      id,
    })
    .returning({ id: usersTable.id, name: usersTable.name });
});

export const updateUser = cache(
  async ({ key, value }: z.infer<typeof UserSchema>) => {
    const { userId } = auth();

    if (!userId) return null;

    const result = UserSchema.safeParse({ key, value });
    if (!result.success) {
      return console.error(result.error.issues);
    }

    await db
      .update(usersTable)
      .set({
        [key]: value,
      })
      .where(eq(usersTable.id, userId));
  }
);

export const getCycles = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  const cycles = await db.query.cycleTable.findMany({
    where: eq(cycleTable.userId, userId),
  });
  return cycles;
});

export type Category = Omit<InsertCategory, "cycleId">;

export const createCycle = cache(
  async ({ date, categories }: { date: DateRange; categories: Category[] }) => {
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
      where: and(
        eq(cycleTable.title, cycleTitle),
        eq(cycleTable.userId, userId)
      ),
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
      }));

      await db.insert(subsycleTable).values(subcyclesArray);

      // create categories for the new cycle
      const categoriesArray = categories.map((category) => ({
        ...category,
        cycleId: newCycleId,
      }));
      await db.insert(categoryTable).values(categoriesArray);
    }
    revalidatePath("/");
  }
);

export const updateCycle = cache(async (cycleId: string, title: string) => {
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

export const getSubcycles = cache(async (cycleId: string) => {
  const { userId } = auth();

  if (!userId) return null;

  if (!cycleId) return null;

  const cycles = await db.query.subsycleTable.findMany({
    where: eq(subsycleTable.cycleId, cycleId),
  });
  return cycles;
});

export const createSubcycle = cache(async (title: string, cycleId: string) => {
  const { userId } = auth();

  if (!userId) return null;

  // Check if a subcycle with the same title already exists
  const existingSubCycle = await db.query.subsycleTable.findFirst({
    where: and(
      eq(subsycleTable.title, title),
      eq(subsycleTable.cycleId, cycleId)
    ),
  });

  if (existingSubCycle) {
    throw new Error("A subcycle with this title already exists.");
  }

  await db.insert(subsycleTable).values({
    cycleId,
    title,
  });

  revalidatePath("/");
});

export const deleteSubcycle = cache(async (subcycleId: string) => {
  const { userId } = auth();

  if (!userId) return null;

  const result = SubcycleSchema.pick({ subcycleId: true }).safeParse({
    subcycleId,
  });

  if (!result.success) {
    return console.error(result.error.issues);
  }

  await db.delete(subsycleTable).where(eq(subsycleTable.id, subcycleId));
  revalidatePath("/");
});

export type CategoryType = "weekly" | "monthly" | "all";

export const getCategories = cache(
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

export const getExpensesByCategoryIds = cache(async (categoryIds: string[]) => {
  const { userId } = auth();

  if (!userId) return null;

  if (!categoryIds) return null;

  const expenses = await db.query.expenseTable.findMany({
    where: inArray(expenseTable.categoryId, categoryIds),
  });

  return expenses;
});
