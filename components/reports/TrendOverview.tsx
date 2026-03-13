"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MonthlyReportWithCycle } from "@/app/actions/report";

type Period = "3M" | "6M" | "1Y";
type Mode = "pct" | "abs";

const PERIOD_MONTHS: Record<Period, number> = { "3M": 3, "6M": 6, "1Y": 12 };

function parseDate(s: string): Date {
  return new Date(s.replace(" ", "T"));
}

function subMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function average(
  arr: MonthlyReportWithCycle[],
  fn: (r: MonthlyReportWithCycle) => number
): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((sum, r) => sum + fn(r), 0) / arr.length;
}

interface ChipData {
  label: string;
  arrow: "↑" | "↓" | null;
  colorClass: string;
  pctLabel: string | null;
  absLabel: string | null;
}

function buildChip(
  label: string,
  currAvg: number | null,
  prevAvg: number | null,
  direction: "higher-better" | "lower-better",
  isRate: boolean
): ChipData {
  if (currAvg === null || prevAvg === null) {
    return { label, arrow: null, colorClass: "text-muted-foreground", pctLabel: null, absLabel: null };
  }

  const diff = currAvg - prevAvg;
  const arrow: "↑" | "↓" | null = diff > 0 ? "↑" : diff < 0 ? "↓" : null;
  const isGood = direction === "higher-better" ? diff > 0 : diff < 0;
  const colorClass =
    diff === 0 ? "text-muted-foreground" : isGood ? "text-green-600" : "text-red-500";

  const sign = diff > 0 ? "+" : "";

  // Rates always show pp for both modes
  if (isRate) {
    const pp = `${sign}${diff.toFixed(1)}pp`;
    return { label, arrow, colorClass, pctLabel: pp, absLabel: pp };
  }

  const pct =
    prevAvg !== 0
      ? `${sign}${(((currAvg - prevAvg) / Math.abs(prevAvg)) * 100).toFixed(1)}%`
      : null;
  const abs = `${sign}${Math.round(diff).toLocaleString()}`;

  return { label, arrow, colorClass, pctLabel: pct, absLabel: abs };
}

function MetricChip({
  label,
  arrow,
  colorClass,
  displayLabel,
}: {
  label: string;
  arrow: "↑" | "↓" | null;
  colorClass: string;
  displayLabel: string | null;
}) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2.5">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {displayLabel === null ? (
        <p className="text-sm font-semibold text-muted-foreground">—</p>
      ) : (
        <p className={`text-base sm:text-lg font-bold ${colorClass}`}>
          {arrow && <span className="mr-0.5">{arrow}</span>}
          {displayLabel}
        </p>
      )}
    </div>
  );
}

interface Props {
  reports: MonthlyReportWithCycle[];
}

export default function TrendOverview({ reports }: Props) {
  const [period, setPeriod] = useState<Period>("3M");
  const [mode, setMode] = useState<Mode>("pct");

  const months = PERIOD_MONTHS[period];
  const now = new Date();
  const cutoff1 = subMonths(now, months);
  const cutoff2 = subMonths(now, months * 2);

  const current = reports.filter((r) => parseDate(r.createdAt) >= cutoff1);
  const previous = reports.filter((r) => {
    const d = parseDate(r.createdAt);
    return d >= cutoff2 && d < cutoff1;
  });

  const netto = (r: MonthlyReportWithCycle) => r.income - r.tax + r.leftover;
  const totalSav = (r: MonthlyReportWithCycle) =>
    r.savingsShortTerm + r.savingsLongTerm + r.invest;

  const c = {
    income: average(current, (r) => r.income),
    netto: average(current, netto),
    savingsRate: average(current, (r) => {
      const n = netto(r);
      return n > 0 ? (totalSav(r) / n) * 100 : 0;
    }),
    taxRate: average(current, (r) =>
      r.income > 0 ? (r.tax / r.income) * 100 : 0
    ),
    balance: average(current, (r) => netto(r) - r.rent - totalSav(r) - r.dayToDay),
  };

  const p = {
    income: average(previous, (r) => r.income),
    netto: average(previous, netto),
    savingsRate: average(previous, (r) => {
      const n = netto(r);
      return n > 0 ? (totalSav(r) / n) * 100 : 0;
    }),
    taxRate: average(previous, (r) =>
      r.income > 0 ? (r.tax / r.income) * 100 : 0
    ),
    balance: average(previous, (r) => netto(r) - r.rent - totalSav(r) - r.dayToDay),
  };

  const chips: ChipData[] = [
    buildChip("Income", c.income, p.income, "higher-better", false),
    buildChip("Netto", c.netto, p.netto, "higher-better", false),
    buildChip("Savings rate", c.savingsRate, p.savingsRate, "higher-better", true),
    buildChip("Tax rate", c.taxRate, p.taxRate, "lower-better", true),
    buildChip("Balance", c.balance, p.balance, "higher-better", false),
  ];

  const note =
    current.length === 0
      ? "No reports in this period."
      : previous.length === 0
        ? `${current.length} report${current.length > 1 ? "s" : ""} in period — no prior period to compare.`
        : `Avg of ${current.length} report${current.length > 1 ? "s" : ""} vs avg of ${previous.length} in the prior period.`;

  return (
    <Card className="mb-4">
      <CardHeader className="p-3 sm:p-4 pb-2 flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle className="text-sm sm:text-base font-semibold">
          Long-term Trend
        </CardTitle>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {(["3M", "6M", "1Y"] as const).map((opt) => (
              <Button
                key={opt}
                variant={period === opt ? "default" : "outline"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setPeriod(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex gap-1">
            <Button
              variant={mode === "pct" ? "default" : "outline"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setMode("pct")}
            >
              %
            </Button>
            <Button
              variant={mode === "abs" ? "default" : "outline"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setMode("abs")}
            >
              Abs
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {chips.map((chip) => (
            <MetricChip
              key={chip.label}
              label={chip.label}
              arrow={chip.arrow}
              colorClass={chip.colorClass}
              displayLabel={mode === "pct" ? chip.pctLabel : chip.absLabel}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}
