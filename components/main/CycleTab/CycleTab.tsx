"use client";
import {
  SelectCategory,
  SelectCycle,
  SelectSubcycle,
  SelectUser,
} from "@/db/schema";
import { TabsContent } from "../../ui/tabs";
import { URLS, useGet } from "@/lib/fetch";
import { Accordion, AccordionItem } from "../../ui/accordion";
import SubcycleAccordionItem from "../../subcycle/SubcycleAccordionItem";
import { Skeleton } from "@/components/ui/skeleton";
import { useCycleContext } from "../MainTable";

export type CategoryWithCurrentAmount = Array<
  SelectCategory & { currentAmount: number }
>;

export type getSubcyclesByCycleIdResponse = {
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
  cycles,
}: {
  cycles?: SelectCycle[] | null;
}) {
  const { selectedSubcycle, updateSubcycle, selectedCycle } = useCycleContext();

  if (!cycles) return null;

  const cycle = cycles.find((c) => c.id === selectedCycle);

  if (!cycle) return null;

  const { data, isLoading } = useGet<getSubcyclesByCycleIdResponse>(
    URLS.subCyclesTable + "?cycleId=" + cycle.id,
    "subcyclesTable"
  );

  if (isLoading) return <CycleTabSkeleton />;

  const subcyclesTable = data?.data;

  if (!subcyclesTable) return null;

  const { subcycles } = subcyclesTable;

  return (
    <TabsContent value={cycle.id} key={cycle.id}>
      <Accordion
        type="single"
        collapsible
        value={selectedSubcycle}
        onValueChange={updateSubcycle}
      >
        {subcycles.map((subcycle) => {
          return (
            <SubcycleAccordionItem
              categories={subcycle.allCategories.weeklyCategories}
              key={subcycle.id}
              subcycle={subcycle}
              cycles={cycles}
            />
          );
        })}
      </Accordion>
    </TabsContent>
  );
}

const CycleTabSkeleton = () => {
  return (
    <Accordion type="single" collapsible value={""}>
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <AccordionItem value={""} key={index}>
            <Skeleton className="h-[56px] w-full flex items-center justify-between">
              <Skeleton className="ml-[16px] h-[32px] w-[250px] bg-gray-300" />
            </Skeleton>
          </AccordionItem>
        ))}
    </Accordion>
  );
};
