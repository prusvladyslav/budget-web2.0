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
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import TwoDatesPicker from "@/components/common/TwoDatesPicker";
import { Collapse } from "@/components/common/Collapse";
import { createWeeksArray } from "@/lib/utils";
import { cyclesActions } from "@/app/actions";

const categorySchema = z.object({
  title: z.string().min(1, "Category name is required"),
  initialAmount: z.number().gt(0, "Initial amount must be greater than 0"),
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
      toast.success("Cycle created successfully");
      reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error creating Cycle");
    }
  };

  const dateRange = watch("date");
  const datesRangeLength = createWeeksArray({ dateRange }).length;

  const categories: FormData["categories"] = watch("categories");

  const total = categories.reduce((acc, curr) => {
    return (
      acc +
      (curr.weekly ? curr.initialAmount * datesRangeLength : curr.initialAmount)
    );
  }, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <ScrollArea className="max-h-[calc(100vh-20px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            <DialogHeader>
              <DialogTitle>Add New Cycle</DialogTitle>
              <DialogDescription>
                The Cycle represents your billing period (month, two weeks,
                etc.)
              </DialogDescription>
            </DialogHeader>

            <Card>
              <CardHeader>
                <CardTitle>Date Range</CardTitle>
              </CardHeader>
              <CardContent>
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
                  <p className="mt-2 text-sm text-red-500">
                    {errors.date.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
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
                  className="mt-4"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
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
    <div className="space-y-4">
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
        <p className="text-sm text-red-500">{errors.categories.message}</p>
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

function Category({
  field,
  index,
  remove,
  errors,
  watch,
  control,
}: CategoryProps) {
  return (
    <Card key={field.id}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Category {index + 1}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          type="button"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          name={`categories.${index}.title`}
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor={`category-title-${index}`}>Name</Label>
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
            <div className="space-y-2">
              <Label htmlFor={`category-amount-${index}`}>Initial Amount</Label>
              <Input
                id={`category-amount-${index}`}
                {...field}
                type="number"
                value={field.value || undefined}
                placeholder="Initial Amount"
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
            <div className="space-y-2">
              <Label>Frequency</Label>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "weekly")}
                value={field.value ? "weekly" : "monthly"}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id={`r1-${index}`} />
                  <Label htmlFor={`r1-${index}`}>Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id={`r2-${index}`} />
                  <Label htmlFor={`r2-${index}`}>Monthly</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
