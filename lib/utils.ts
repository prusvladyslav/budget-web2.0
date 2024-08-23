import { type ClassValue, clsx } from "clsx";
import { differenceInCalendarDays, format, parse } from "date-fns";
import { DateRange } from "react-day-picker";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateRange(dateRange: DateRange): string {
  if (!dateRange.from || !dateRange.to) return "";

  const fromFormatted = format(dateRange.from, "dd.MM");
  const toFormatted = format(dateRange.to, "dd.MM");

  return `${fromFormatted} - ${toFormatted}`;
}
export function formatDate(date: Date, withYear = true): string {
  return format(date, withYear ? "dd.MM.yyyy" : "dd.MM");
}

export function parseDateRange(dateRangeStr: string): DateRange | null {
  const [fromFormatted, toFormatted] = dateRangeStr.split(" - ");

  if (!fromFormatted || !toFormatted) return null;

  const currentYear = new Date().getFullYear();

  const fromDate = parse(fromFormatted, "dd.MM", new Date());
  const toDate = parse(toFormatted, "dd.MM", new Date());

  const from = new Date(fromDate.setFullYear(currentYear));
  const to = new Date(toDate.setFullYear(currentYear));

  return {
    from,
    to,
  };
}

import { startOfWeek, endOfWeek, addWeeks, isBefore, isAfter } from "date-fns";

export function createWeeksArray({ dateRange }: { dateRange: DateRange }) {
  const { from, to } = dateRange;
  if (!from || !to) return [];
  const startDate = new Date(from);
  const endDate = new Date(to);
  const weeks = [];

  let currentStart = startDate;
  let currentEnd = endOfWeek(startDate, { weekStartsOn: 1 });

  while (isBefore(currentStart, endDate)) {
    weeks.push({
      from: currentStart,
      to: isAfter(currentEnd, endDate) ? endDate : currentEnd,
    });

    currentStart = addWeeks(currentStart, 1);
    currentStart = startOfWeek(currentStart, { weekStartsOn: 1 });
    currentEnd = endOfWeek(currentStart, { weekStartsOn: 1 });
  }

  return weeks;
}

export function calculateAmountByDays({
  dateRange,
  amount,
}: {
  dateRange: DateRange;
  amount: number;
}) {
  const { from, to } = dateRange;
  const result = differenceInCalendarDays(
    new Date(2012, 6, 2, 0, 0),
    new Date(2011, 6, 2, 23, 0)
  );
}
