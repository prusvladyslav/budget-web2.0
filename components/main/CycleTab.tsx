"use client";
import { SelectCycle, SelectSubcycle, SelectUser } from "@/db/schema";
import { TabsContent } from "../ui/tabs";
import SubcycleAccordion from "../subcycle/SubcycleAccordion";
import { useDebouncedUserUpdate } from "./MainTable/useMainTable";
import { URLS, useGet } from "@/lib/fetch";

export default function CycleTab({
  cycle,
  user,
}: {
  cycle: SelectCycle;
  user: SelectUser;
}) {
  const debouncedUpdateUserSubcycle = useDebouncedUserUpdate(
    "lastOpenedSubcycleId"
  );

  const { data } = useGet<SelectSubcycle[]>(
    URLS.subCycles + "?cycleId=" + cycle.id
  );

  const subcycles = data?.data;

  if (!subcycles) return null;

  return (
    <TabsContent value={cycle.id} key={cycle.id}>
      <SubcycleAccordion
        cycleId={cycle.id}
        user={user}
        subcycles={subcycles}
        debouncedUpdateUserSubcycle={debouncedUpdateUserSubcycle}
      />
    </TabsContent>
  );
}
