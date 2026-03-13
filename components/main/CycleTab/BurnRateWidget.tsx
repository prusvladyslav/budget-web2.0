"use client";
import { parse, differenceInCalendarDays, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { CategoryWithCurrentAmount, getSubcyclesByCycleIdResponse } from "./CycleTab";

type Subcycle = getSubcyclesByCycleIdResponse["subcycles"][number];
// CategoryWithCurrentAmount is Array<SelectCategory & { currentAmount: number }>
type CategoryItem = CategoryWithCurrentAmount[number];

function parseDateRangeWithYear(fullDate: string | null | undefined): { from: Date; to: Date } | null {
  if (!fullDate) return null;
  const parts = fullDate.split(" - ");
  if (parts.length !== 2) return null;
  try {
    const from = parse(parts[0], "dd.MM.yyyy", new Date());
    const to = parse(parts[1], "dd.MM.yyyy", new Date());
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
    return { from, to };
  } catch {
    return null;
  }
}

function getPaceMetrics(
  totalBudget: number,
  totalRemaining: number,
  from: Date,
  to: Date,
  today: Date
) {
  const totalDays = differenceInCalendarDays(to, from) + 1;
  const rawElapsed = differenceInCalendarDays(today, from) + 1;
  const daysElapsed = Math.max(0, Math.min(rawElapsed, totalDays));

  const pctDays = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
  const totalSpent = totalBudget - totalRemaining;
  const pctBudget = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const expectedSpent = totalDays > 0 ? (daysElapsed / totalDays) * totalBudget : 0;
  const diff = Math.round(totalSpent - expectedSpent);
  const pctDiff = Math.round(pctBudget - pctDays);
  const isOver = diff > 0;

  return {
    pctDays: Math.round(pctDays),
    pctBudget: Math.round(pctBudget),
    diff,
    pctDiff,
    isOver,
    daysElapsed,
    totalDays,
  };
}

function calcTotals(categories: CategoryItem[]) {
  return categories.reduce(
    (acc, cat) => ({
      budget: acc.budget + cat.initialAmount,
      remaining: acc.remaining + cat.currentAmount,
    }),
    { budget: 0, remaining: 0 }
  );
}

function PaceBar({ pct, colored }: { pct: number; colored: boolean }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${colored ? "bg-primary" : "bg-muted-foreground/40"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function PaceCard({
  label,
  dateLabel,
  metrics,
}: {
  label: string;
  dateLabel: string;
  metrics: ReturnType<typeof getPaceMetrics>;
}) {
  const { pctDays, pctBudget, diff, pctDiff, isOver, daysElapsed, totalDays } = metrics;

  return (
    <Card className="flex-1 min-w-0">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
          {label}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{dateLabel}</p>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Time</span>
            <span className="text-xs text-muted-foreground">
              {daysElapsed}/{totalDays}d
            </span>
          </div>
          <PaceBar pct={pctDays} colored={false} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Spent</span>
            <span className="text-xs text-muted-foreground">{pctBudget}%</span>
          </div>
          <PaceBar pct={pctBudget} colored />
        </div>
        <div
          className={`flex items-center gap-1 pt-0.5 text-xs font-semibold ${
            isOver
              ? "text-red-600 dark:text-red-400"
              : "text-green-700 dark:text-green-400"
          }`}
        >
          {isOver ? (
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>
            {isOver
              ? `+${pctDiff}% | +${diff.toLocaleString()} ahead of pace`
              : `-${Math.abs(pctDiff)}% | ${Math.abs(diff).toLocaleString()} under pace`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

type Props = {
  subcycles: Subcycle[];
  monthlyCategories: CategoryWithCurrentAmount;
};

export default function BurnRateWidget({ subcycles, monthlyCategories }: Props) {
  const today = new Date();

  // Derive cycle date range from first/last subcycle fullDate
  const subcyclesWithDates = subcycles
    .map((s) => ({ ...s, parsed: parseDateRangeWithYear(s.fullDate) }))
    .filter(
      (s): s is typeof s & { parsed: NonNullable<typeof s.parsed> } =>
        s.parsed !== null
    );

  if (subcyclesWithDates.length === 0) return null;

  const cycleFrom = subcyclesWithDates[0].parsed.from;
  const cycleTo = subcyclesWithDates[subcyclesWithDates.length - 1].parsed.to;

  // All category items for cycle-level metrics
  const allCategoryItems: CategoryItem[] = [
    ...subcycles.flatMap((s) => s.categories),
    ...monthlyCategories,
  ];

  const { budget: cycleBudget, remaining: cycleRemaining } = calcTotals(allCategoryItems);

  if (cycleBudget === 0) return null;

  const cycleMetrics = getPaceMetrics(cycleBudget, cycleRemaining, cycleFrom, cycleTo, today);

  const cycleDateLabel = `${cycleFrom.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
  })} – ${cycleTo.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
  })}`;

  // Find active subcycle (whose date range contains today)
  const activeSubcycle = subcyclesWithDates.find((s) =>
    isWithinInterval(today, { start: s.parsed.from, end: s.parsed.to })
  );

  const weekCard = activeSubcycle
    ? (() => {
        const { budget: weekBudget, remaining: weekRemaining } = calcTotals(
          activeSubcycle.categories
        );
        if (weekBudget === 0) return null;
        const weekMetrics = getPaceMetrics(
          weekBudget,
          weekRemaining,
          activeSubcycle.parsed.from,
          activeSubcycle.parsed.to,
          today
        );
        return (
          <PaceCard
            label="Week pace"
            dateLabel={activeSubcycle.title}
            metrics={weekMetrics}
          />
        );
      })()
    : null;

  return (
    <div className="flex gap-2 py-2">
      <PaceCard label="Cycle pace" dateLabel={cycleDateLabel} metrics={cycleMetrics} />
      {weekCard}
    </div>
  );
}
