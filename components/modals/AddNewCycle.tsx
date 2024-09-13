"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDays } from "date-fns";
import { toast } from "sonner";
import { PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormField } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import TwoDatesPicker from "@/components/common/TwoDatesPicker";
import { createWeeksArray } from "@/lib/utils";
import { cyclesActions } from "@/app/actions";

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
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  triggerElement: React.ReactNode;
};

export default function AddNewCycle({ triggerElement }: Props) {
  const [open, setOpen] = useState(false);
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
      categories: [{ title: "", initialAmount: 0, weekly: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await cyclesActions.createCycle(data);
      toast.success("Cycle created");
      reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error creating Cycle");
    }
  };

  const dateRange = watch("date");
  const datesRangeLength = createWeeksArray({ dateRange }).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent className="max-w-[90vw] md:max-w-xl md:max-w-xl p-0">
        <ScrollArea className="max-h-[95vh]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 p-3 md:p-6 sm:p-4"
          >
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base sm:text-lg">
                New Cycle
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Set your billing period
              </DialogDescription>
            </DialogHeader>

            <Card className="overflow-hidden">
              <CardHeader className="p-2 sm:p-3">
                <CardTitle className="text-sm sm:text-base">
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
                <CardTitle className="text-sm sm:text-base">
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
                  className="w-full text-xs md:text-base"
                >
                  <PlusIcon className="mr-1 h-3 w-3" />
                  Add Category
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" className="text-base md:text-lg">
                Save
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

type CategoriesProps = {
  fields: Record<"id", string>[];
  remove: (index: number) => void;
  control: any;
  errors: any;
  watch: any;
  datesRangeLength: number;
};

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

type CategoryProps = {
  field: Record<"id", string>;
  index: number;
  datesRangeLength: number;
  remove: (index: number) => void;
  errors: any;
  watch: any;
  control: any;
};

function Category({ field, index, remove, errors, control }: CategoryProps) {
  return (
    <Card key={field.id} className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-2">
        <CardTitle className="text-xs md:text-base font-medium">
          Category {index + 1}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          type="button"
          className="h-6 w-6 p-0"
        >
          <TrashIcon className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-2 p-2">
        <FormField
          name={`categories.${index}.title`}
          control={control}
          render={({ field }) => (
            <div className="space-y-1">
              <Label
                htmlFor={`category-title-${index}`}
                className="text-xs md:text-base"
              >
                Name
              </Label>
              <Input
                id={`category-title-${index}`}
                {...field}
                placeholder="Category name"
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
                className="text-xs md:text-base"
              >
                Amount
              </Label>
              <Input
                id={`category-amount-${index}`}
                {...field}
                type="number"
                value={field.value || undefined}
                placeholder="Amount"
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
              {errors.categories?.[index]?.initialAmount && (
                <p className="text-xs text-red-500">
                  {errors.categories[index].initialAmount.message}
                </p>
              )}
            </div>
          )}
        />
        <FormField
          name={`categories.${index}.weekly`}
          control={control}
          render={({ field }) => (
            <div className="space-y-1">
              <Label className="text-xs md:text-base">Frequency</Label>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "weekly")}
                value={field.value ? "weekly" : "monthly"}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="weekly" id={`r1-${index}`} />
                  <Label
                    htmlFor={`r1-${index}`}
                    className="text-xs md:text-base"
                  >
                    Weekly
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="monthly" id={`r2-${index}`} />
                  <Label
                    htmlFor={`r2-${index}`}
                    className="text-xs md:text-base"
                  >
                    Monthly
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
