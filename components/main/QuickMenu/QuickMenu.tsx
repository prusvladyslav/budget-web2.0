import AddNewCycle from "@/components/modals/AddNewCycle";
import AddNewExpense from "@/components/modals/AddNewExpense";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { SelectUser } from "@/db/schema";
import { useCycleContext } from "../MainTable";

export default function QuickMenu({ user }: { user: SelectUser }) {
  const { cycles } = useCycleContext();
  return (
    <div className="flex h-10 items-center rounded-md border bg-background">
      {cycles && cycles?.length > 0 && (
        <AddNewExpense
          triggerElement={<Button variant="ghost">Add new expense</Button>}
        />
      )}
      <Separator orientation="vertical" className="m-0" />
      <AddNewCycle
        triggerElement={<Button variant={"ghost"}>Add new cycle</Button>}
      />
    </div>
  );
}
