"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { addDays } from "date-fns";
import TwoDatesPicker from "../common/TwoDatesPicker";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { TrashIcon, PlusIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { createWeeksArray } from "@/lib/utils";
import { cyclesActions } from "@/app/actions";
import { FormField } from "../ui/form";

type Props = {
  triggerElement: React.ReactNode;
};

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
      toast.success(`Cycle created successfully`);
    } catch (error) {
      console.error(error);
      toast.error(`Error creating Cycle`);
    } finally {
      reset();
      setOpen(false);
    }
  };

  const dateRange = watch("date");

  const datesRangeLength = createWeeksArray({ dateRange }).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <ScrollArea className="max-h-[calc(100vh-20px)] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Adding new Cycle</DialogTitle>
              <DialogDescription>
                The Cycle represents your billing period (month, two weeks,
                etc.)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date From and To:</Label>
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
                  <p className="text-red-500">{errors.date.message}</p>
                )}
              </div>
              <Categories
                fields={fields}
                append={append}
                remove={remove}
                control={control}
                errors={errors}
                watch={watch}
                datesRangeLength={datesRangeLength}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

type CategoriesProps = {
  fields: Record<"id", string>[];
  append: (value: Omit<cyclesActions.Category, "userId">) => void;
  remove: (index: number) => void;
  control: any;
  errors: any;
  watch: any;
  datesRangeLength: number;
};

const Categories = ({
  fields,
  append,
  remove,
  control,
  errors,
  watch,
  datesRangeLength,
}: CategoriesProps) => {
  const all: FormData["categories"] = watch("categories");

  const total = all.reduce((acc, curr) => {
    if (curr.weekly) {
      return acc + curr.initialAmount * datesRangeLength;
    }
    return acc + curr.initialAmount;
  }, 0);
  return (
    <>
      <ol className="space-y-4">
        {fields.map((field, index) => {
          const weekly: boolean = watch(`categories.${index}.weekly`);

          const amount: number = weekly
            ? watch(`categories.${index}.initialAmount`) * datesRangeLength
            : watch(`categories.${index}.initialAmount`);

          const title: string = watch(`categories.${index}.title`);
          return (
            <li key={field.id} className="space-y-2 w-[97.5%] mx-auto">
              {index !== 0 && <Separator className="" />}
              <div className="flex items-center justify-between">
                <span>Category {index + 1}.</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-6 h-6"
                  onClick={() => remove(index)}
                  type="button"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
              <FormField
                name={`categories.${index}.title`}
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Category name" />
                )}
              />
              {errors.categories?.[index]?.title && (
                <p className="text-red-500">
                  {errors.categories[index].title.message}
                </p>
              )}
              <FormField
                name={`categories.${index}.initialAmount`}
                control={control}
                defaultValue={undefined}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    value={field.value || undefined}
                    placeholder="Initial Amount"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />
              {errors.categories?.[index]?.initialAmount && (
                <p className="text-red-500">
                  {errors.categories[index].initialAmount.message}
                </p>
              )}
              <div>
                <Label>Monthly category or weekly?</Label>
                <FormField
                  name={`categories.${index}.weekly`}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "weekly")
                      }
                      value={field.value ? "weekly" : "monthly"}
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
                  )}
                />
              </div>
              {amount && title ? (
                <h3 className="mt-2">
                  Your monthly total for{" "}
                  <span className="bold underline">{title}</span> will be:{" "}
                  <span className="bold underline">{amount}</span>
                </h3>
              ) : null}
            </li>
          );
        })}
      </ol>
      <Button
        variant="outline"
        size="sm"
        onClick={() => append({ title: "", initialAmount: 0, weekly: true })}
        type="button"
      >
        <PlusIcon className="w-4 h-4" />
        Add Category
      </Button>
      {errors.categories && (
        <p className="text-red-500">{errors.categories.message}</p>
      )}
      {all.length > 0 && all.every((category) => !!category.initialAmount) && (
        <h3>
          Your monthly total for this cycle will be:{" "}
          <span className="bold underline">{total}</span>
        </h3>
      )}
    </>
  );
};
