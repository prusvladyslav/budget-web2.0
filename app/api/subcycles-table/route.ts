import {
  categoriesActions,
  expensesActions,
  subcyclesActions,
} from "@/app/actions";
import { SelectCategory, SelectExpense } from "@/db/schema";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cycleId = searchParams.get("cycleId");

  if (!cycleId) return new Response("No cycleId provided", { status: 400 });

  const subcycles = await subcyclesActions.getSubcyclesByCycleId(cycleId);

  const allCaregories = await categoriesActions.getCategoriesByCycleId({
    cycleId,
    categoryType: "all",
  });

  if (!allCaregories)
    return new Response("No categories found", { status: 400 });

  const categoriesByType = (categories: SelectCategory[], isWeekly: boolean) =>
    categories.filter((category) => category.weekly === isWeekly);

  const calculateCurrentAmount = (
    categories: SelectCategory[],
    expenses: SelectExpense[] | null,
    subcycleId: string
  ) =>
    categories.map((category) => ({
      ...category,
      currentAmount:
        expenses && expenses.length > 0
          ? category.initialAmount -
            expenses
              .filter(
                (expense) =>
                  expense.categoryId === category.id &&
                  expense.subcycleId === subcycleId
              )
              .reduce((acc, curr) => acc + curr.amount, 0)
          : category.initialAmount,
    }));

  const weeklyCategories = categoriesByType(allCaregories, true);
  const monthlyCategories = categoriesByType(allCaregories, false);

  const [monthlyExpenses, weeklyExpenses] = await Promise.all([
    expensesActions.getExpensesByCategoryIds(
      monthlyCategories.map((category) => category.id)
    ),
    expensesActions.getExpensesByCategoryIds(
      weeklyCategories.map((category) => category.id)
    ),
  ]);

  const result = {
    subcycles: subcycles?.map((subcycle) => {
      return {
        ...subcycle,
        allCategories: {
          weeklyCategories: calculateCurrentAmount(
            weeklyCategories,
            weeklyExpenses,
            subcycle.id
          ),
          monthlyCategories: calculateCurrentAmount(
            monthlyCategories,
            monthlyExpenses,
            subcycle.id
          ),
        },
      };
    }),
  };

  return new Response(JSON.stringify(result));
}
