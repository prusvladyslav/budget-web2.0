import {
  categoriesActions,
  expensesActions,
  subcyclesActions,
} from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;

  const cycleId = searchParams.get("cycleId");

  if (!cycleId) return new NextResponse("No cycleId provided", { status: 400 });

  try {
    const expenses = await expensesActions.getAllExpensesTable(cycleId);
    const subcycles = await subcyclesActions.getSubcyclesByCycleId(cycleId);

    const byCategory = subcycles?.map((subcycle) => {
      const thisSubcycleExpenses = expenses?.filter(
        (expense) => expense.subcycleId === subcycle.id
      );
      const subcycleObj: Record<string, string | number> = {
        title: subcycle.title,
      };
      if (thisSubcycleExpenses && thisSubcycleExpenses.length > 0) {
        for (const expense of thisSubcycleExpenses) {
          subcycleObj[expense.category] = expense.amount;
        }
      }
      return subcycleObj;
    });

    const categories = await categoriesActions.getCategoriesByCycleId({
      cycleId,
      categoryType: "weekly",
    });

    const byAmount = subcycles?.map((subcycle) => {
      const initialAmount =
        categories?.reduce(
          (acc, category) => acc + category.initialAmount,
          0
        ) || 0;
      return {
        title: subcycle.title,
        initialAmount,
        currentAmount:
          initialAmount -
          (expenses
            ?.filter((expense) => expense.subcycleId === subcycle.id)
            .reduce((acc, expense) => acc + expense.amount, 0) || 0),
      };
    });
    const result = {
      byCategory,
      byAmount,
    };

    return new NextResponse(JSON.stringify(result));
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
