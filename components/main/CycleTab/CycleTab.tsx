"use client";
import { SelectCategory, SelectCycle, SelectSubcycle } from "@/db/schema";
import { TabsContent } from "../../ui/tabs";
import { URLS, useGet } from "@/lib/fetch";
import { Accordion, AccordionItem } from "../../ui/accordion";
import SubcycleAccordionItem from "../../subcycle/SubcycleAccordionItem";
import { Skeleton } from "@/components/ui/skeleton";
import { useCycleContext } from "../MainTable";
import MonthlyAccordionItem from "@/components/subcycle/MonthlyAccordionItem";

export type CategoryWithCurrentAmount = Array<
  SelectCategory & { currentAmount: number }
>;

export type getSubcyclesByCycleIdResponse = {
  subcycles: Array<
    SelectSubcycle & {
      allCategories: {
        weeklyCategories: CategoryWithCurrentAmount;
      };
    }
  >;
  monthlyCategories: CategoryWithCurrentAmount;
};

export default function CycleTab() {
  const {
    selectedSubcycleId,
    updateSubcycleId,
    cycles,
    selectedCycle: cycle,
  } = useCycleContext();

  if (!cycles) return null;

  if (!cycle) return null;

  const { data, isLoading } = useGet<getSubcyclesByCycleIdResponse>(
    URLS.subCyclesTable + "?cycleId=" + cycle.id,
    "subcyclesTable"
  );

  if (isLoading) return <CycleTabSkeleton />;

  const subcyclesTable = data?.data;

  if (!subcyclesTable) return null;

  const { subcycles, monthlyCategories } = subcyclesTable;

  const leftInWeeklyCategories = subcycles.reduce(
    (acc, subcycle) =>
      acc +
      subcycle.allCategories.weeklyCategories.reduce(
        (acc, category) => acc + category.currentAmount,
        0
      ),
    0
  );

  const leftInMonthyCategories = monthlyCategories.reduce(
    (acc, category) => acc + category.currentAmount,
    0
  );

  return (
    <TabsContent value={cycle.id} key={cycle.id}>
      <Accordion
        type="single"
        collapsible
        value={selectedSubcycleId}
        onValueChange={updateSubcycleId}
      >
        {subcycles.map((subcycle) => {
          return (
            <SubcycleAccordionItem
              categories={subcycle.allCategories.weeklyCategories}
              key={subcycle.id}
              subcycle={subcycle}
            />
          );
        })}
        {monthlyCategories.length > 0 && (
          <MonthlyAccordionItem categories={monthlyCategories} />
        )}
        <div className="h-[56px] p-4 font-semibold text-lg border-1 bg-muted/60">
          Total:{" "}
          <span className="font-black">
            {Math.trunc(leftInWeeklyCategories + leftInMonthyCategories)}
          </span>
        </div>
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
