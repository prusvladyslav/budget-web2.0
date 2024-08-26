import {
  expensesActions,
  categoriesActions,
  subcyclesActions,
  cyclesActions,
} from "../actions";
import type { Metadata } from "next";
import { ExpensesTable } from "@/components/expenses/ExpenseTable/ExpensesTable";
import GeneralLink from "@/components/common/GeneralLink";
import { columns } from "@/components/expenses/ExpenseTable/columns";

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
    <>
      <GeneralLink href="/">Go back</GeneralLink>
      <div className="flex justify-between">
        <h2 className="text-lg font-bold">Expenses history</h2>
      </div>
      <ExpensesTable
        cycles={cycles}
        subcycles={subcycles}
        columns={columns}
        data={expenses}
        categories={categories}
      />
    </>
  );
}
