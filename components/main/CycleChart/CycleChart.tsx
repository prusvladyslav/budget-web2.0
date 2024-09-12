"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { URLS, useGet } from "@/lib/fetch";
import { useCycleContext } from "../MainTable";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { lazy, useState } from "react";
import ChartByAmount from "./ChartByAmount";

const ChartByCategoryLazy = lazy(() => import("./ChartByCategory"));

export type ExpensesBySubcycle = {
  byCategory: Array<{ title: string } & Record<string, number>>;
  byAmount: Array<{
    title: string;
    initialAmount: number;
    currentAmount: number;
  }>;
};

export interface CategoryConfig {
  label: string;
  color: string;
}

export default function CycleChart() {
  const [chartType, setChartType] = useState<string>("amount");

  const { selectedCycleId } = useCycleContext();

  const { data, isLoading } = useGet<ExpensesBySubcycle>(
    URLS.expensesBySubcycle + `?cycleId=${selectedCycleId}`,
    "expensesBySubcycle"
  );

  const chartData = data?.data;

  const chartDataByCategory = chartData?.byCategory;
  const chartDataByAmount = chartData?.byAmount;
  return (
    <Card className="p-4 flex flex-col space-y-4">
      <CardHeader className="p-0">Cycle chart</CardHeader>
      <div className="">
        <RadioGroup
          value={chartType}
          onValueChange={(value) => setChartType(value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="categories" id="r1" />
            <Label htmlFor="r1">Expenses by categories</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="amount" id="r2" />
            <Label htmlFor="r2">Initial amount vs current </Label>
          </div>
        </RadioGroup>
      </div>
      {!isLoading && chartData && (
        <CardContent className="pt-2">
          {chartType === "categories" ? (
            <ChartByCategoryLazy data={chartDataByCategory} />
          ) : (
            <ChartByAmount data={chartDataByAmount} />
          )}
        </CardContent>
      )}
    </Card>
  );
}
