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
import React from "react";
import { BurgerMenu } from "@/components/common/BurgerMenu";
import { getUser } from "../actions/users";
import SubpageHeader from "@/components/common/SubpageHeader";

export const metadata: Metadata = {
  title: "Expenses history",
  description: "Expenses tracking app. Expenses history page",
};

export default async function Page() {
  const user = await getUser();
  const [expenses, categories, cycles, subcycles] = await Promise.all([
    expensesActions.getAllExpensesTable(),
    categoriesActions.getAllCategories(),
    cyclesActions.getCycles(),
    subcyclesActions.getSubcyclesAll(),
  ]);

  if (!expenses || !categories || !cycles || !subcycles) return null;

  return (
    <>
      <SubpageHeader user={user} pageTitle="Expenses history" />

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
