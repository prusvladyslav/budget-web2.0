import { db } from "@/db";
import { subsycleTable, categoryTable, expenseTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql, and, isNull } from "drizzle-orm";
import { cache } from "react";

export const getSubcyclesTable = cache(async (cycleId: string) => {
  const { userId } = auth();
  if (!userId || !cycleId) return null;

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

  const preparedMonthlyCategories = db.query.categoryTable
    .findMany({
      where: and(
        eq(categoryTable.cycleId, sql.placeholder("cycleId")),
        eq(categoryTable.weekly, false)
      ),
      columns: {
        id: true,
        initialAmount: true,
        title: true,
      },
      with: {
        expenses: {
          where: isNull(expenseTable.subcycleId),
          columns: {
            amount: true,
          },
        },
      },
    })
    .prepare();

  const monthlyCategories = await preparedMonthlyCategories.execute({
    cycleId: cycleId,
  });

  const mappedMonthyCategories = monthlyCategories.map((category) => {
    return {
      ...category,
      currentAmount:
        category.initialAmount -
        category.expenses.reduce((acc, item) => acc + item.amount, 0),
    };
  });

  return {
    subcycles: mappedSubcycles,
    monthlyCategories: mappedMonthyCategories,
  };
});
