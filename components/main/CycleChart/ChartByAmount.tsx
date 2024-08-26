import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ExpensesBySubcycle } from "./CycleChart";

const config = {
  initialAmount: {
    label: "Initial",
    color: "#2563eb",
  },
  currentAmount: {
    label: "Current",
    color: "#45a049",
  },
};

export default function ChartByAmount({
  data,
}: {
  data?: ExpensesBySubcycle["byAmount"];
}) {
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
