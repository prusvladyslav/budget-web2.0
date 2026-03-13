"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { reportActions } from "@/app/actions";

const schema = z.object({
  income: z.number({ invalid_type_error: "Required" }).gt(0),
  tax: z.number({ invalid_type_error: "Required" }).gte(0),
  rent: z.number({ invalid_type_error: "Required" }).gte(0),
  savingsShortTerm: z.number({ invalid_type_error: "Required" }).gte(0),
  savingsLongTerm: z.number({ invalid_type_error: "Required" }).gte(0),
  invest: z.number({ invalid_type_error: "Required" }).gte(0),
  dayToDay: z.number({ invalid_type_error: "Required" }).gte(0),
  leftover: z.number({ invalid_type_error: "Required" }).gte(0),
});

type ReportFormData = z.infer<typeof schema>;

const FIELDS: { name: keyof ReportFormData; label: string }[] = [
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
  cycleId: string;
  dayToDayDefault: number;
  onSuccess: () => void;
  onSkip: () => void;
}

export default function MonthlyReportForm({
  cycleId,
  dayToDayDefault,
  onSuccess,
  onSkip,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      income: undefined,
      tax: undefined,
      rent: undefined,
      savingsShortTerm: undefined,
      savingsLongTerm: undefined,
      invest: undefined,
      dayToDay: dayToDayDefault || undefined,
      leftover: undefined,
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      await reportActions.createMonthlyReport({ cycleId, ...data });
      onSuccess();
    } catch {
      toast.error("Error saving monthly report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {FIELDS.map(({ name, label }) => (
          <FormField
            key={name}
            name={name}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">{label}</FormLabel>
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

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-sm"
            onClick={onSkip}
          >
            Skip
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 text-sm sm:text-base h-10 sm:h-11"
          >
            Save Report
          </Button>
        </div>
      </form>
    </Form>
  );
}
