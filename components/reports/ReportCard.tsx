"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";
import { PencilIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Modal from "@/components/modals/Modal";
import { reportActions } from "@/app/actions";
import type { MonthlyReportWithCycle } from "@/app/actions/report";
import type { SelectCycle } from "@/db/schema";

const schema = z.object({
  cycleId: z.string().min(1, "Required"),
  income: z.number({ invalid_type_error: "Required" }).gt(0),
  tax: z.number({ invalid_type_error: "Required" }).gte(0),
  rent: z.number({ invalid_type_error: "Required" }).gte(0),
  savingsShortTerm: z.number({ invalid_type_error: "Required" }).gte(0),
  savingsLongTerm: z.number({ invalid_type_error: "Required" }).gte(0),
  invest: z.number({ invalid_type_error: "Required" }).gte(0),
  dayToDay: z.number({ invalid_type_error: "Required" }).gte(0),
  leftover: z.number({ invalid_type_error: "Required" }).gte(0),
});

type FormData = z.infer<typeof schema>;

const FIELDS: { name: keyof FormData; label: string }[] = [
  { name: "income", label: "Income" },
  { name: "tax", label: "Tax" },
  { name: "rent", label: "Rent" },
  { name: "savingsShortTerm", label: "Savings (short term)" },
  { name: "savingsLongTerm", label: "Savings (long term)" },
  { name: "invest", label: "Invest" },
  { name: "dayToDay", label: "Day-to-day" },
  { name: "leftover", label: "Leftover" },
];

interface Props {
  report: MonthlyReportWithCycle;
  previousReport?: MonthlyReportWithCycle | null;
  cycles: SelectCycle[];
}

function formatNum(n: number) {
  return n.toLocaleString();
}

function formatPercent(value: number, base: number) {
  if (base === 0) return "—";
  return (value / base * 100).toFixed(1) + "%";
}

type TrendDirection = "higher-better" | "lower-better" | "neutral";

function getTrend(
  current: number,
  previous: number | undefined,
  direction: TrendDirection
): { arrow: string; colorClass: string } | null {
  if (previous === undefined || current === previous) return null;
  const up = current > previous;
  if (direction === "neutral") {
    return { arrow: up ? "↑" : "↓", colorClass: "text-muted-foreground" };
  }
  const isGood = direction === "higher-better" ? up : !up;
  return {
    arrow: up ? "↑" : "↓",
    colorClass: isGood ? "text-green-600" : "text-red-500",
  };
}

function StatRow({
  label,
  value,
  percent,
  trend,
  highlight,
  colorClass,
}: {
  label: string;
  value: number;
  percent?: string;
  trend?: { arrow: string; colorClass: string } | null;
  highlight?: boolean;
  colorClass?: string;
}) {
  return (
    <div
      className={`flex items-center py-0.5 gap-2 ${highlight ? "font-semibold" : ""}`}
    >
      <span className="text-xs sm:text-sm text-muted-foreground flex-1">{label}</span>
      <span className={`text-xs sm:text-sm ${colorClass ?? ""} text-right`}>
        {formatNum(value)}
      </span>
      <span className="text-xs text-muted-foreground w-12 text-right">
        {percent ?? ""}
      </span>
      <span className={`text-sm w-4 text-right ${trend ? trend.colorClass : "invisible"}`}>
        {trend ? trend.arrow : "↑"}
      </span>
    </div>
  );
}

export default function ReportCard({ report, previousReport, cycles }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const netto = report.income - report.tax + report.leftover;
  const totalSavings =
    report.savingsShortTerm + report.savingsLongTerm + report.invest;
  const balance = netto - report.rent - totalSavings - report.dayToDay;

  const prev = previousReport ?? undefined;
  const prevNetto = prev ? prev.income - prev.tax + prev.leftover : undefined;
  const prevTotalSavings = prev
    ? prev.savingsShortTerm + prev.savingsLongTerm + prev.invest
    : undefined;
  const prevBalance =
    prevNetto !== undefined && prevTotalSavings !== undefined && prev
      ? prevNetto - prev.rent - prevTotalSavings - prev.dayToDay
      : undefined;

  const currTaxPct = report.income > 0 ? report.tax / report.income : 0;
  const prevTaxPct =
    prev && prev.income > 0 ? prev.tax / prev.income : undefined;

  const trends = {
    income: getTrend(report.income, prev?.income, "higher-better"),
    tax: getTrend(currTaxPct, prevTaxPct, "lower-better"),
    rent: getTrend(report.rent, prev?.rent, "lower-better"),
    savingsShortTerm: getTrend(report.savingsShortTerm, prev?.savingsShortTerm, "higher-better"),
    savingsLongTerm: getTrend(report.savingsLongTerm, prev?.savingsLongTerm, "higher-better"),
    invest: getTrend(report.invest, prev?.invest, "higher-better"),
    dayToDay: getTrend(report.dayToDay, prev?.dayToDay, "neutral"),
    netto: getTrend(netto, prevNetto, "higher-better"),
    totalSavings: getTrend(totalSavings, prevTotalSavings, "higher-better"),
    balance: getTrend(balance, prevBalance, "higher-better"),
  };

  const balanceColor =
    balance === 0
      ? "text-green-600"
      : balance > 0
        ? "text-yellow-600"
        : "text-red-600";

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cycleId: report.cycleId,
      income: report.income,
      tax: report.tax,
      rent: report.rent,
      savingsShortTerm: report.savingsShortTerm,
      savingsLongTerm: report.savingsLongTerm,
      invest: report.invest,
      dayToDay: report.dayToDay,
      leftover: report.leftover,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await reportActions.updateMonthlyReport({ reportId: report.id, ...data });
      toast.success("Report updated");
      setEditOpen(false);
      router.refresh();
    } catch {
      toast.error("Error updating report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-2">
          <CardTitle className="text-sm sm:text-base font-semibold">
            {report.cycleTitle}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditOpen(true)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
          {/* Income section */}
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
              Income
            </p>
            <StatRow label="Gross income" value={report.income} trend={trends.income} />
            <StatRow label="Tax" value={report.tax} percent={formatPercent(report.tax, report.income)} trend={trends.tax} />
            <StatRow label="Leftover" value={report.leftover} />
            <Separator className="my-1" />
            <StatRow
              label="Netto"
              value={netto}
              trend={trends.netto}
              highlight
              colorClass="text-green-700 dark:text-green-400"
            />
          </div>

          {/* Allocations section */}
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
              Allocations
            </p>
            <StatRow label="Rent" value={report.rent} percent={formatPercent(report.rent, netto)} trend={trends.rent} />
            <StatRow label="Savings (short term)" value={report.savingsShortTerm} percent={formatPercent(report.savingsShortTerm, netto)} trend={trends.savingsShortTerm} />
            <StatRow label="Savings (long term)" value={report.savingsLongTerm} percent={formatPercent(report.savingsLongTerm, netto)} trend={trends.savingsLongTerm} />
            <StatRow label="Invest" value={report.invest} percent={formatPercent(report.invest, netto)} trend={trends.invest} />
            <StatRow label="Day-to-day" value={report.dayToDay} percent={formatPercent(report.dayToDay, netto)} trend={trends.dayToDay} />
            <Separator className="my-1" />
            <StatRow label="Total savings" value={totalSavings} percent={formatPercent(totalSavings, netto)} trend={trends.totalSavings} highlight />
          </div>

          {/* Balance */}
          <div>
            <Separator className="mb-2" />
            <StatRow
              label="Balance (Netto − allocations)"
              value={balance}
              percent={formatPercent(balance, netto)}
              trend={trends.balance}
              highlight
              colorClass={balanceColor}
            />
          </div>
        </CardContent>
      </Card>

      <Modal
        dialogTitle={`Edit — ${report.cycleTitle}`}
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) form.reset();
          setEditOpen(open);
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              name="cycleId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Cycle</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="text-xs sm:text-sm md:text-base">
                        <SelectValue placeholder="Select cycle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cycles.map((cycle) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {FIELDS.map(({ name, label }) => (
              <FormField
                key={name}
                name={name}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">
                      {label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                        className="text-xs sm:text-sm md:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-sm sm:text-base h-10 sm:h-11"
            >
              Update Report
            </Button>
          </form>
        </Form>
      </Modal>
    </>
  );
}
