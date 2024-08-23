import { ExpensesTable } from "@/components/expenses/ExpenseTable/ExpensesTable";
import { columns } from "@/components/expenses/ExpenseTable/columns";
import GeneralLink from "@/components/common/GeneralLink";
import {
  expensesActions,
  categoriesActions,
  subcyclesActions,
  cyclesActions,
} from "../actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expenses history",
  description: "Expenses tracking app. Expenses history page",
};

export default async function Page() {
  const [expenses, categories, cycles, subcycles] = await Promise.all([
    expensesActions.getAllExpensesTable(),
    categoriesActions.getAllCategories(),
    cyclesActions.getCycles(),
    subcyclesActions.getSubcyclesAll(),
  ]);

  if (!expenses || !categories || !cycles || !subcycles) return null;

  return (
    <div className="space-y-4">
      <GeneralLink href="/">Go back</GeneralLink>
      <ExpensesTable
        cycles={cycles}
        subcycles={subcycles}
        columns={columns}
        data={expenses}
        categories={categories}
      />
    </div>
  );
}
