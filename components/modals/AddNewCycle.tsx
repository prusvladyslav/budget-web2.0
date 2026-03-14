"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDays } from "date-fns";
import { toast } from "sonner";
import { PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import TwoDatesPicker from "@/components/common/TwoDatesPicker";
import { createWeeksArray } from "@/lib/utils";
import { cyclesActions, usersActions } from "@/app/actions";
import Modal from "./Modal";
import MonthlyReportForm from "./MonthlyReportForm";

const categorySchema = z.object({
  title: z.string().min(1, "Required"),
  initialAmount: z.number().gt(0, "Must be > 0"),
  weekly: z.boolean(),
});

const formSchema = z.object({
  date: z.object({
    from: z.date(),
    to: z.date(),
  }),
  categories: z
    .array(categorySchema)
    .min(1, "At least one category is required"),
  createMonthlyReport: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  triggerElement?: React.ReactNode;
  defaultCategories: Array<{
    title: string;
    initialAmount: number | undefined;
    weekly: boolean;
  }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AddNewCycle({
  triggerElement,
  defaultCategories,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen! : internalOpen;
  const [step, setStep] = useState<1 | 2>(1);
  const [createdCycleId, setCreatedCycleId] = useState<string | null>(null);
  const [dayToDayDefault, setDayToDayDefault] = useState<number>(0);

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: {
        from: new Date(),
        to: addDays(new Date(), 31),
      },
      categories: defaultCategories,
      createMonthlyReport: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories",
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep(1);
      setCreatedCycleId(null);
      setDayToDayDefault(0);
      reset();
    }
    if (isControlled) {
      externalOnOpenChange?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const [result] = await Promise.all([
        cyclesActions.createCycle(data),
        usersActions.updateUserLastCreatedCategoriesJson(data.categories),
      ]);

      if (data.createMonthlyReport && result?.cycleId) {
        setCreatedCycleId(result.cycleId);
        setDayToDayDefault(result.cycleTotal ?? 0);
        setStep(2);
      } else {
        toast.success("Cycle created");
        reset();
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating Cycle");
    }
  };

  const dateRange = watch("date");
  const datesRangeLength = createWeeksArray({ dateRange }).length;

  return (
    <Modal
      dialogTitle={step === 1 ? "New Cycle" : "Monthly Report"}
      triggerElement={triggerElement}
      open={open}
      onOpenChange={handleOpenChange}
    >
      {step === 1 ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Card className="overflow-hidden">
            <CardHeader className="p-2 sm:p-3">
              <CardTitle className="text-xs sm:text-sm md:text-base">
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              <FormField
                name="date"
                control={control}
                render={({ field }) => (
                  <TwoDatesPicker
                    date={field.value}
                    setDate={(newDate) => field.onChange(newDate)}
                  />
                )}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.date.message}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="p-2 sm:p-3">
              <CardTitle className="text-xs sm:text-sm md:text-base">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 space-y-2">
              <Categories
                fields={fields}
                remove={remove}
                control={control}
                errors={errors}
                watch={watch}
                datesRangeLength={datesRangeLength}
              />
              <Button
                variant="outline"
                onClick={() =>
                  append({ title: "", initialAmount: 0, weekly: true })
                }
                type="button"
                className="w-full text-xs sm:text-sm md:text-base"
              >
                <PlusIcon className="mr-1 h-3 w-3" />
                Add Category
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 py-1">
            <FormField
              name="createMonthlyReport"
              control={control}
              render={({ field }) => (
                <>
                  <Checkbox
                    id="create-monthly-report"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label
                    htmlFor="create-monthly-report"
                    className="text-sm cursor-pointer"
                  >
                    Create monthly report
                  </Label>
                </>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full text-sm sm:text-base h-10 sm:h-11"
          >
            Save
          </Button>
        </form>
      ) : (
        <MonthlyReportForm
          cycleId={createdCycleId!}
          dayToDayDefault={dayToDayDefault}
          onSuccess={() => {
            toast.success("Cycle and report created");
            reset();
            setStep(1);
            setOpen(false);
          }}
          onSkip={() => {
            toast.success("Cycle created");
            reset();
            setStep(1);
            setOpen(false);
          }}
        />
      )}
    </Modal>
  );
}

interface CategoriesProps {
  fields: Record<"id", string>[];
  remove: (index: number) => void;
  control: any;
  errors: any;
  watch: any;
  datesRangeLength: number;
}

function Categories({
  fields,
  remove,
  control,
  errors,
  watch,
  datesRangeLength,
}: CategoriesProps) {
  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <Category
          key={field.id}
          field={field}
          index={index}
          datesRangeLength={datesRangeLength}
          remove={remove}
          errors={errors}
          watch={watch}
          control={control}
        />
      ))}
      {errors.categories && (
        <p className="text-xs text-red-500">{errors.categories.message}</p>
      )}
    </div>
  );
}

interface CategoryProps {
  field: Record<"id", string>;
  index: number;
  datesRangeLength: number;
  remove: (index: number) => void;
  errors: any;
  watch: any;
  control: any;
}

function Category({ field, index, remove, errors, control }: CategoryProps) {
  return (
    <Card key={field.id} className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-2">
        <CardTitle className="text-sm sm:text-base font-medium">
          Category {index + 1}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          type="button"
          className="h-8 w-8 sm:h-10 sm:w-10 p-0"
        >
          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-2 p-2 px-3 sm:px-4">
        <FormField
          name={`categories.${index}.title`}
          control={control}
          render={({ field }) => (
            <div className="space-y-1">
              <Label
                htmlFor={`category-title-${index}`}
                className="text-xs sm:text-sm md:text-base"
              >
                Name
              </Label>
              <Input
                id={`category-title-${index}`}
                {...field}
                placeholder="Category name"
                className="text-xs sm:text-sm md:text-base"
              />
              {errors.categories?.[index]?.title && (
                <p className="text-xs text-red-500">
                  {errors.categories[index].title.message}
                </p>
              )}
            </div>
          )}
        />
        <FormField
          name={`categories.${index}.initialAmount`}
          control={control}
          defaultValue={undefined}
          render={({ field }) => (
            <div className="space-y-1">
              <Label
                htmlFor={`category-amount-${index}`}
                className="text-xs sm:text-sm md:text-base"
              >
                Amount
              </Label>
              <Input
                id={`category-amount-${index}`}
                {...field}
                type="number"
                value={field.value || undefined}
                placeholder="Amount"
                onChange={(e) =>
                  field.onChange(Number.parseFloat(e.target.value))
                }
                className="text-xs sm:text-sm md:text-base"
              />
              {errors.categories?.[index]?.initialAmount && (
                <p className="text-xs text-red-500">
                  {errors.categories[index].initialAmount.message}
                </p>
              )}
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
