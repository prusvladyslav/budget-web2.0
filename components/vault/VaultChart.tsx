"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { SelectVaultSnapshot } from "@/db/schema";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

type Props = {
  snapshots: SelectVaultSnapshot[];
};

const chartConfig = {
  totalUah: {
    label: "UAH",
    color: "#2563eb",
  },
  totalUsd: {
    label: "USD",
    color: "#45a049",
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function VaultChart({ snapshots }: Props) {
  if (snapshots.length < 2) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-2">
          <CardTitle className="text-sm sm:text-base font-semibold">
            Net Worth History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Save vault changes to start tracking net worth
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = snapshots.map((s) => ({
    date: formatDate(s.createdAt),
    totalUah: Math.round(s.totalUah),
    totalUsd: Math.round(s.totalUsd),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-6">
        <CardTitle className="tracking-tight text-2xl font-bold">
          Net Worth History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
          <LineChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.toLocaleString()}
              width={70}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString()} ${name === "totalUah" ? "₴" : "$"}`,
                    name === "totalUah" ? "UAH" : "USD",
                  ]}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="totalUah"
              stroke={chartConfig.totalUah.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="totalUsd"
              stroke={chartConfig.totalUsd.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
