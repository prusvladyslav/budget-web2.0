"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import * as z from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  id: z.string().min(1, "Invalid user ID"),
});

const UpdateUserSchema = z.object({
  lastOpenedCycleId: z.string().optional(),
  lastOpenedSubcycleId: z.string().optional(),
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
  return await db
    .insert(usersTable)
    .values({
      name,
      id,
    })
    .returning({ id: usersTable.id, name: usersTable.name });
});

export const updateUser = cache(
  async (updates: z.infer<typeof UpdateUserSchema>) => {
    const { userId } = auth();
    if (!userId) return null;

    const result = UpdateUserSchema.safeParse(updates);
    if (!result.success) {
      console.error(result.error.issues);
      return null;
    }

    const validUpdates = result.data;
    await db
      .update(usersTable)
      .set(validUpdates)
      .where(eq(usersTable.id, userId));

    return validUpdates;
  }
);
