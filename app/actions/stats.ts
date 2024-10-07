"use server";

import { db } from "@/db";
import {
  categoryTable,
  cycleTable,
  expenseTable,
  subsycleTable,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getExpensesBySubcycle(cycleId: string) {
  if (!cycleId) {
    throw new Error("No cycleId provided");
  }

  try {
    const preparedCycle = db.query.cycleTable
      .findFirst({
        columns: {},
        where: eq(cycleTable.id, sql.placeholder("cycleId")),
        with: {
          subcycles: {
            where: eq(subsycleTable.cycleId, sql.placeholder("cycleId")),
            with: {
              categories: {
                where: eq(categoryTable.cycleId, sql.placeholder("cycleId")),
                columns: {
                  initialAmount: true,
                  title: true,
                },
                with: {
                  expenses: {
                    where: eq(expenseTable.cycleId, sql.placeholder("cycleId")),
                    columns: {
                      subcycleId: true,
                      amount: true,
                    },
                  },
                },
              },
            },
            columns: {
              title: true,
              id: true,
            },
          },
        },
      })
      .prepare();

    const cycle = await preparedCycle.execute({ cycleId: cycleId });

    if (!cycle) {
      throw new Error("No cycle found");
    }

    const byAmount = cycle.subcycles.map((subcycle) => {
      const initialAmount = subcycle.categories.reduce(
        (acc, category) => acc + category.initialAmount,
        0
      );
      return {
        title: subcycle.title,
        initialAmount: initialAmount,
        currentAmount:
          initialAmount -
          subcycle.categories.reduce(
            (acc, category) =>
              acc +
              category.expenses.reduce(
                (acc, expense) => acc + expense.amount,
                0
              ),
            0
          ),
      };
    });

    const result = {
      byAmount,
    };

    return result;
  } catch (error) {
    console.error("Error in getExpensesBySubcycle:", error);
    throw error;
  }
}
