import AddNewCycle from "@/components/modals/AddNewCycle";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";

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
    <AddNewCycle
      defaultCategories={defaultCategories}
      triggerElement={
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      }
    />
  );
}
