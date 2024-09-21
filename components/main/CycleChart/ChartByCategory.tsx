"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CategoryConfig, ExpensesBySubcycle } from "./CycleChart";

export default function ChartByCategory({
  data,
}: {
  data?: ExpensesBySubcycle["byCategory"];
}) {
  if (!data) return <></>;

  const config = generateChartConfigByCategory(data);

  return (
    <ChartContainer config={config} className="max-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="title"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis type="number" domain={[0, "dataMax"]} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {Object.entries(config).map(([key, value]) => (
          <Bar key={key} dataKey={key} fill={value.color} radius={2} />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

interface ChartConfig {
  [key: string]: CategoryConfig;
}

function generateColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

function generateChartConfigByCategory(
  data?: ExpensesBySubcycle["byCategory"]
): ChartConfig {
  const result: ChartConfig = {};

  data?.forEach((item) => {
    for (const [key, value] of Object.entries(item)) {
      if (key !== "title" && !(key in result)) {
        result[key] = {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: generateColor(key),
        };
      }
    }
  });

  return result;
}
