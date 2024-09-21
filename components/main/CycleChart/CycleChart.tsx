"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { URLS, useGet } from "@/lib/fetch";
import { useCycleContext } from "../MainTable";
import { useState } from "react";
import ChartByAmount from "./ChartByAmount";
import { Switch } from "@/components/ui/switch";

export type ExpensesBySubcycle = {
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
  const [open, setOpen] = useState(false);

  const { selectedCycleId } = useCycleContext();

  const { data, isLoading } = useGet<ExpensesBySubcycle>(
    open ? URLS.expensesBySubcycle + `?cycleId=${selectedCycleId}` : null,
    "expensesBySubcycle"
  );

  const chartData = data?.data;

  const chartDataByAmount = chartData?.byAmount;

  return (
    <Card className="p-4 flex flex-col space-y-4">
      <CardHeader className="p-0 flex flex-row items-center gap-4">
        Cycle chart
        <Switch
          className="cursor-pointer"
          checked={open}
          onCheckedChange={setOpen}
        />
      </CardHeader>
      {/* {open && (
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
      )} */}
      {!isLoading && chartData && (
        <CardContent className="pt-2">
          <ChartByAmount data={chartDataByAmount} />
        </CardContent>
      )}
    </Card>
  );
}
