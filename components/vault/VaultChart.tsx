"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SelectVaultSnapshot } from "@/db/schema";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

type Props = {
  snapshots: SelectVaultSnapshot[];
};

type ViewMode = "simple" | "detailed";
type Range = "1m" | "3m" | "6m" | "1y" | "all";

const RANGES: Array<{ value: Range; label: string; months: number | null }> = [
  { value: "1m", label: "1M", months: 1 },
  { value: "3m", label: "3M", months: 3 },
  { value: "6m", label: "6M", months: 6 },
  { value: "1y", label: "1Y", months: 12 },
  { value: "all", label: "All", months: null },
];

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

/** SQLite CURRENT_TIMESTAMP is "YYYY-MM-DD HH:MM:SS" in UTC without a zone marker. */
function parseCreatedAt(value: string) {
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return new Date(hasZone ? normalized : `${normalized}Z`);
}

function formatDay(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthDay(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

function formatDayTime(d: Date) {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatFull(d: Date) {
  return d.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function rangeStart(range: Range) {
  const months = RANGES.find((r) => r.value === range)?.months ?? null;
  if (months === null) return null;
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  return start;
}

/** Simple view: one point per calendar day (last snapshot of that day). */
function lastSnapshotPerDay(snapshots: SelectVaultSnapshot[]) {
  const byDay = new Map<string, SelectVaultSnapshot>();
  for (const s of snapshots) {
    byDay.set(dayKey(parseCreatedAt(s.createdAt)), s);
  }
  return Array.from(byDay.values());
}

function toChartData(
  snapshots: SelectVaultSnapshot[],
  mode: ViewMode,
  spansYears: boolean,
) {
  return snapshots.map((s) => {
    const d = parseCreatedAt(s.createdAt);
    const label =
      mode === "detailed"
        ? formatDayTime(d)
        : spansYears
          ? formatMonthDay(d)
          : formatDay(d);
    return {
      date: label,
      fullDate: formatFull(d),
      totalUah: Math.round(s.totalUah),
      totalUsd: Math.round(s.totalUsd),
    };
  });
}

export default function VaultChart({ snapshots }: Props) {
  const [mode, setMode] = useState<ViewMode>("simple");
  const [range, setRange] = useState<Range>("3m");

  const data = useMemo(() => {
    const start = rangeStart(range);
    const inRange = start
      ? snapshots.filter((s) => parseCreatedAt(s.createdAt) >= start)
      : snapshots;
    const source = mode === "detailed" ? inRange : lastSnapshotPerDay(inRange);
    const spansYears =
      source.length > 1 &&
      parseCreatedAt(source[0].createdAt).getFullYear() !==
        parseCreatedAt(source[source.length - 1].createdAt).getFullYear();
    return toChartData(source, mode, spansYears);
  }, [snapshots, mode, range]);

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

  const detailed = mode === "detailed";
  // Detailed mode plots every snapshot; angle labels once they get dense.
  const denseLabels = detailed || data.length > 12;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 p-6">
        <CardTitle className="tracking-tight text-2xl font-bold">
          Net Worth History
        </CardTitle>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList className="h-8">
              {RANGES.map((r) => (
                <TabsTrigger
                  key={r.value}
                  value={r.value}
                  className="h-6 px-2 text-xs"
                >
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs value={mode} onValueChange={(v) => setMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="simple" className="h-6 px-2 text-xs">
                Simple
              </TabsTrigger>
              <TabsTrigger value="detailed" className="h-6 px-2 text-xs">
                Detailed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        {data.length < 2 ? (
          <p className="text-xs sm:text-sm text-muted-foreground">
            Not enough snapshots in this range. Try a longer range.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className={
              detailed ? "max-h-[340px] w-full" : "max-h-[220px] w-full"
            }
          >
            <LineChart data={data} accessibilityLayer>
              <CartesianGrid vertical={detailed} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
                angle={denseLabels ? -35 : 0}
                textAnchor={denseLabels ? "end" : "middle"}
                height={denseLabels ? 56 : undefined}
                interval={detailed ? 0 : "preserveStartEnd"}
                minTickGap={detailed ? 0 : 24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toLocaleString()}
                width={70}
                className="text-xs"
                domain={detailed ? ["auto", "auto"] : [0, "auto"]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullDate ??
                      payload?.[0]?.payload?.date
                    }
                    formatter={(value, name) => [
                      `${Number(value).toLocaleString()} ${name === "totalUah" ? "₴" : "$"}`,
                      name === "totalUah" ? "UAH" : "USD",
                    ]}
                  />
                }
              />
              {detailed && <ChartLegend content={<ChartLegendContent />} />}
              <Line
                type="monotone"
                dataKey="totalUah"
                stroke={chartConfig.totalUah.color}
                strokeWidth={2}
                dot={detailed ? { r: 3 } : false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="totalUsd"
                stroke={chartConfig.totalUsd.color}
                strokeWidth={2}
                dot={detailed ? { r: 3 } : false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
