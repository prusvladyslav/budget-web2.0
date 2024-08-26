import AddNewCycle from "@/components/modals/AddNewCycle";
import AddNewExpense from "@/components/modals/AddNewExpense";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { SelectUser } from "@/db/schema";

export default function QuickMenu({ user }: { user: SelectUser }) {
  return (
    <div className="flex h-10 items-center rounded-md border bg-background">
      <AddNewExpense
        triggerElement={<Button variant="ghost">Add new expense</Button>}
      />
      <Separator orientation="vertical" className="m-0" />
      <AddNewCycle
        triggerElement={<Button variant={"ghost"}>Add new cycle</Button>}
      />
    </div>
  );
}
