import { type ClassValue, clsx } from "clsx";
import { differenceInCalendarDays, format, parse } from "date-fns";
import type { DateRange } from "react-day-picker";
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
  dateRange: DateRange | null;
  amount: number;
}) {
  if (!dateRange) return 0;

  const { from, to } = dateRange;

  if (!from || !to) return 0;

  const difference = differenceInCalendarDays(to, from) + 1;

  return Math.trunc((amount / 7) * difference);
}

export function convertDateFormat(inputDate: string) {
  // Split the input date string into day, month, and year
  const [day, month, year] = inputDate.split(".");

  // Pad the day and month with leading zeros if necessary
  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");

  // Return the date in YYYY-MM-DD format
  return `${year}-${paddedMonth}-${paddedDay}`;
}
