import AddNewCycle from "@/components/modals/AddNewCycle";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function QuickMenu({
  cycles,
}: {
  cycles: Array<{ id: string; title: string }> | null;
}) {
  const { userId } = auth();

  if (!userId) return null;

  const data = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: {
      lastCreatedCategoriesJson: true,
    },
  });

  const defaultCategories =
    data && data.lastCreatedCategoriesJson
      ? (JSON.parse(data.lastCreatedCategoriesJson) as Array<{
          title: string;
          initialAmount: number;
          weekly: boolean;
        }>)
      : [{ title: "", initialAmount: undefined, weekly: true }];

  return (
    <div className="flex h-10 items-center rounded-md border bg-background">
      {cycles && cycles?.length > 0 && (
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          href="/?expensesModal=active"
        >
          Add expense
        </Link>
      )}
      <Separator orientation="vertical" className="m-0" />
      <AddNewCycle
        defaultCategories={defaultCategories}
        triggerElement={<Button variant={"ghost"}>Add new cycle</Button>}
      />
    </div>
  );
}
