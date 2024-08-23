"use server";
import { db } from "@/db";
import { subsycleTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import * as z from "zod";

const SubcycleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  cycleId: z.string().min(1, "Invalid cycle ID"),
  subcycleId: z.string().min(1, "Invalid subcycle ID"),
});

export const getSubcyclesByCycleId = cache(async (cycleId: string) => {
  const { userId } = auth();

  if (!userId) return null;

  if (!cycleId) return null;

  const cycles = await db.query.subsycleTable.findMany({
    where: eq(subsycleTable.cycleId, cycleId),
  });
  return cycles;
});

export const getSubcyclesAll = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  const subcycles = await db.query.subsycleTable.findMany({
    where: eq(subsycleTable.userId, userId),
  });
  return subcycles;
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
    userId,
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
