import { db } from "@/db";
import { categoryTable, expenseTable, subsycleTable } from "@/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cycleId = searchParams.get("cycleId");

  if (!cycleId) return new Response("No cycleId provided", { status: 400 });

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

  const result = {
    subcycles: mappedSubcycles,
    monthlyCategories: mappedMonthyCategories,
  };

  return new Response(JSON.stringify(result));
}
