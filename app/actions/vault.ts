"use server";

import { db } from "@/db";
import { type InsertVault, vaultTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";

export const getVault = cache(async () => {
  const { userId } = auth();
  if (!userId) return null;

  const vault = await db.query.vaultTable.findMany({
    where: eq(vaultTable.userId, userId),
  });

  return vault;
});

export const updateAccounts = cache(
  async (accounts: Array<Omit<InsertVault, "userId">>) => {
    const { userId } = auth();

    if (!userId) return null;

    await db.delete(vaultTable).where(eq(vaultTable.userId, userId));
    if (accounts.length > 0) {
      await db
        .insert(vaultTable)
        .values(accounts.map((account) => ({ ...account, userId })));
    }
    revalidatePath("/vault");
  }
);

const getExchangeRates = async () => {
  try {
    const response = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/uah.json",
      { next: { revalidate: 86400000 } }
    );
    return response.json() as unknown as {
      date: string;
      uah: Record<string, number>;
    };
  } catch (error) {
    console.error("Trying fallback");
    const response = await fetch(
      "https://latest.currency-api.pages.dev/v1/currencies/uah.json",
      { next: { revalidate: 86400000 } }
    );
    return response.json() as unknown as {
      date: string;
      uah: Record<string, number>;
    };
  }
};

export const getVaultTotal = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  const vault = await db.query.vaultTable.findMany({
    where: eq(vaultTable.userId, userId),
  });

  const rate = await getExchangeRates();

  const currencyTotals = vault.reduce((acc, account) => {
    const existingTotal = acc.find(
      (item) => item.currency === account.currency
    );
    if (existingTotal) {
      existingTotal.amount += account.amount;
    } else {
      acc.push({
        currency: account.currency,
        amount: account.amount,
      });
    }
    return acc;
  }, [] as Array<{ currency: string; amount: number }>);

  const uahTotal = currencyTotals.reduce(
    (acc, account) =>
      acc + account.amount / rate.uah[account.currency.toLowerCase()],
    0
  );
  const usdTotal = uahTotal * rate.uah.usd;

  return {
    currencyTotals,
    generalTotal: {
      uahTotal,
      usdTotal,
    },
  };
});

export const getMainAccount = cache(async () => {
  const { userId } = auth();

  if (!userId) return null;

  return await db.query.vaultTable.findFirst({
    where: and(eq(vaultTable.userId, userId), eq(vaultTable.isMain, true)),
  });
});

export const deductFromMainAccount = async (amount: number) => {
  const { userId } = auth();

  if (!userId) return null;

  const mainAccount = await getMainAccount();

  if (!mainAccount) return null;

  const newAmount = mainAccount.amount - amount;

  if (newAmount < 0) return null;

  await db
    .update(vaultTable)
    .set({ amount: newAmount })
    .where(eq(vaultTable.id, mainAccount.id));

  revalidatePath("/vault");
};

export const addToMainAccount = async (amount: number) => {
  const { userId } = auth();

  if (!userId) return null;

  const mainAccount = await getMainAccount();

  if (!mainAccount) return null;

  const newAmount = mainAccount.amount + amount;

  await db
    .update(vaultTable)
    .set({ amount: newAmount })
    .where(eq(vaultTable.id, mainAccount.id));

  revalidatePath("/vault");
};
