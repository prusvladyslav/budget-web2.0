"use client";
import {
  SelectCategory,
  SelectCycle,
  SelectSubcycle,
  SelectUser,
} from "@/db/schema";
import { TabsContent } from "../../ui/tabs";
import { useDebouncedUserUpdate } from "../MainTable/useMainTable";
import { URLS, useGet } from "@/lib/fetch";
import { useCycleTab } from "./useCycleTab";
import { Accordion } from "../../ui/accordion";
import SubcycleAccordionItem from "../../subcycle/SubcycleAccordionItem";

export type CategoryWithCurrentAmount = Array<
  SelectCategory & { currentAmount: number }
>;

export type getSubcyclesResponse = {
  subcycles: Array<
    SelectSubcycle & {
      allCategories: {
        weeklyCategories: CategoryWithCurrentAmount;
        monthlyCategories: CategoryWithCurrentAmount;
      };
    }
  >;
};

export default function CycleTab({
  cycle,
  user,
}: {
  cycle?: SelectCycle;
  user: SelectUser;
}) {
  if (!cycle) return null;

  const debouncedUpdateUserSubcycle = useDebouncedUserUpdate(
    "lastOpenedSubcycleId"
  );

  const { selectedSubcycle, updateSelectedSubcycleValue } = useCycleTab(
    user.lastOpenedSubcycleId || "",
    debouncedUpdateUserSubcycle
  );

  const { data, isLoading } = useGet<getSubcyclesResponse>(
    URLS.subCyclesTable + "?cycleId=" + cycle.id
  );

  const subcyclesTable = data?.data;

  if (isLoading) return "Loading...";

  if (!subcyclesTable) return null;

  const { subcycles } = subcyclesTable;

  return (
    <TabsContent value={cycle.id} key={cycle.id}>
      <Accordion
        type="single"
        collapsible
        value={selectedSubcycle}
        onValueChange={updateSelectedSubcycleValue}
      >
        {subcycles.map((subcycle) => {
          return (
            <SubcycleAccordionItem
              selectedSubcycle={selectedSubcycle}
              categories={subcycle.allCategories.weeklyCategories}
              key={subcycle.id}
              subcycle={subcycle}
            />
          );
        })}
      </Accordion>
    </TabsContent>
  );
}
