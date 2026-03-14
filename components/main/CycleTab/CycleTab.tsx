"use client";
import type { SelectCategory, SelectSubcycle } from "@/db/schema";
import { TabsContent } from "../../ui/tabs";
import { URLS, useGet } from "@/lib/fetch";
import { Accordion, AccordionItem } from "../../ui/accordion";
import SubcycleAccordionItem from "../../subcycle/SubcycleAccordionItem";
import { Skeleton } from "@/components/ui/skeleton";
import { useCycleContext } from "../MainTable";
import { QuickExpensesModal } from "@/components/modals/QuickExpensesModal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { parse, isWithinInterval } from "date-fns";
import { getCycleReportData } from "@/app/actions/report";
import {
  exportExpensesToXlsx,
  exportExpensesGroupedByLabel,
} from "@/lib/xlsx-export";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import BurnRateWidget from "./BurnRateWidget";

export type CategoryWithCurrentAmount = Array<
  SelectCategory & { currentAmount: number }
>;

export type getSubcyclesByCycleIdResponse = {
  subcycles: Array<
    SelectSubcycle & {
      categories: CategoryWithCurrentAmount;
      fullDate: string | null;
    }
  >;
  monthlyCategories: CategoryWithCurrentAmount;
};

export default function CycleTab() {
  const {
    selectedSubcycleId,
    selectedCycleId,
    updateSubcycleId,
    cycles,
    selectedCycle: cycle,
  } = useCycleContext();

  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async (type: "history" | "grouped-by-label") => {
    if (!selectedCycleId) return;

    setIsExporting(true);
    try {
      const reportData = await getCycleReportData(selectedCycleId);

      if (!reportData || reportData.expenses.length === 0) {
        toast.error("No expenses found for this cycle");
        return;
      }

      if (type === "history") {
        exportExpensesToXlsx(reportData.expenses, reportData.cycleName);
      } else {
        exportExpensesGroupedByLabel(reportData.expenses, reportData.cycleName);
      }

      toast.success("Report downloaded successfully", {
        action: {
          label: "Open in Google Sheets",
          onClick: () => {
            window.open(
              "https://docs.google.com/spreadsheets/u/0/?usp=sheets_home",
              "_blank"
            );
          },
        },
        duration: 8000,
      });
    } catch (error) {
      toast.error("Failed to generate report");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const quickExpenseModalActive =
    searchParams?.get("quickExpenses") === "active";

  const { data, isLoading } = useGet<getSubcyclesByCycleIdResponse>(
    `${URLS.subCyclesTable}?cycleId=${selectedCycleId}`,
    "subcyclesTable"
  );

  const loadedSubcycles = data?.data?.subcycles;

  // Auto-open the current week if nothing is open yet
  useEffect(() => {
    if (!loadedSubcycles || selectedSubcycleId) return;
    const today = new Date();
    const current = loadedSubcycles.find((s) => {
      if (!s.fullDate) return false;
      const parts = s.fullDate.split(" - ");
      if (parts.length !== 2) return false;
      const from = parse(parts[0], "dd.MM.yyyy", new Date());
      const to = parse(parts[1], "dd.MM.yyyy", new Date());
      return isWithinInterval(today, { start: from, end: to });
    });
    if (current) updateSubcycleId(current.id);
  }, [loadedSubcycles]);

  if (!cycles) return null;

  if (!cycle) return null;

  if (isLoading) return <CycleTabSkeleton />;

  const subcyclesTable = data?.data;

  if (!subcyclesTable) return null;

  const { subcycles, monthlyCategories } = subcyclesTable;

  const today = new Date();
  const currentSubcycleId = subcycles.find((s) => {
    if (!s.fullDate) return false;
    const parts = s.fullDate.split(" - ");
    if (parts.length !== 2) return false;
    const from = parse(parts[0], "dd.MM.yyyy", new Date());
    const to = parse(parts[1], "dd.MM.yyyy", new Date());
    return isWithinInterval(today, { start: from, end: to });
  })?.id;

  const leftInWeeklyCategories = subcycles.reduce(
    (acc, subcycle) =>
      acc +
      subcycle.categories.reduce(
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
    <TabsContent value={cycle.id} key={cycle.id} className="mt-0">
      <BurnRateWidget subcycles={subcycles} monthlyCategories={monthlyCategories} />
      <Accordion
        type="single"
        collapsible
        value={selectedSubcycleId}
        onValueChange={updateSubcycleId}
      >
        {subcycles.map((subcycle) => (
          <SubcycleAccordionItem
            categories={subcycle.categories}
            key={subcycle.id}
            subcycle={subcycle}
            monthly={false}
            isCurrent={subcycle.id === currentSubcycleId}
          />
        ))}
        {monthlyCategories.length > 0 && (
          <SubcycleAccordionItem
            monthly={true}
            categories={monthlyCategories}
          />
        )}
        <div className="h-[56px] p-4 font-semibold text-lg border-1 bg-muted/60 items-center flex justify-between">
          <div>
            Total:{" "}
            <span className="font-black">
              {Math.trunc(leftInWeeklyCategories + leftInMonthyCategories)}
            </span>
          </div>
          <div className="gap-4 flex">
            {cycles.at(-1)?.id === selectedCycleId && (
              <Link href={"/?quickExpenses=active"}>
                <Button>Quick Expenses</Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"outline"}
                  className="hidden md:flex items-center gap-1"
                  disabled={isExporting}
                >
                  {isExporting ? "Generating..." : "Generate report"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportReport("history")}>
                  Expenses history
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExportReport("grouped-by-label")}
                >
                  Grouped by label
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {quickExpenseModalActive && <QuickExpensesModal />}
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
          <AccordionItem value={""} key={index + _}>
            <Skeleton className="h-[56px] w-full flex items-center justify-between">
              <Skeleton className="ml-[16px] h-[32px] w-[250px] bg-gray-300" />
            </Skeleton>
          </AccordionItem>
        ))}
    </Accordion>
  );
};
