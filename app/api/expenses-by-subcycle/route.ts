import {
  categoriesActions,
  expensesActions,
  subcyclesActions,
} from "@/app/actions";
import { db } from "@/db";
import {
  categoryTable,
  cycleTable,
  expenseTable,
  subsycleTable,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;

  const cycleId = searchParams.get("cycleId");

  if (!cycleId) return new NextResponse("No cycleId provided", { status: 400 });

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

    if (!cycle) return new NextResponse("No cycle found", { status: 400 });

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

    return new NextResponse(JSON.stringify(result));
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
