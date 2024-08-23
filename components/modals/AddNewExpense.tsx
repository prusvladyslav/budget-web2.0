"use client";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DatePicker from "../common/DatePicker";
import SelectBasic from "../common/SelectBasic";
import { SelectCategory, SelectCycle, SelectSubcycle } from "@/db/schema";
import { URLS, useGet } from "@/lib/fetch";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { useSWRConfig } from "swr";
import AddExpenseButton from "../common/AddExpenseButton";
import { useCycleContext } from "../main/MainTable";
import { expensesActions } from "@/app/actions";

type Props = {
  cycles: SelectCycle[] | null;
  categoryId?: string;
};

const formSchema = z.object({
  date: z.date(),
  cycleId: z.string().min(1, "Please select a cycle"),
  subcycleId: z.string().min(1, "Please select a subcycle"),
  categoryId: z.string().min(1, "Please select a category"),
  comment: z.string().optional(),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Expense amount must be greater than 0")
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function AddNewExpense({ cycles, categoryId }: Props) {
  const [open, setOpen] = useState(false);

  const { selectedCycle, selectedSubcycle } = useCycleContext();

  const defaultValues = {
    date: new Date(),
    cycleId: selectedCycle || "",
    subcycleId: selectedSubcycle || "",
    categoryId: categoryId || "",
    amount: 0,
    comment: "",
  };

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const cycledId = watch("cycleId");

  type getSubcyclesByCycleIdWithCategories = {
    subcycles: SelectSubcycle[];
    categories: SelectCategory[];
  };

  const { data, isLoading } = useGet<getSubcyclesByCycleIdWithCategories>(
    open ? URLS.subCyclesWithCategories + "?cycleId=" + cycledId : null,
    "subcyclesWithCategories"
  );

  const subcycles = data?.data.subcycles;

  const categories = data?.data.categories;

  const { mutate } = useSWRConfig();

  const onSubmit = async (data: FormData) => {
    try {
      await expensesActions.addExpense({
        ...data,
        date: data.date.toISOString(),
      });
      mutate(() => true);
      toast.success(`Expense added successfully`);
    } catch (error) {
      console.error(error);
      toast.error(`Error adding expense`);
    } finally {
      reset();
      setOpen(false);
    }
  };

  useEffect(() => {
    reset(defaultValues);
  }, [categoryId, selectedSubcycle, selectedCycle]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <AddExpenseButton />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <ScrollArea className="max-h-[calc(100vh-20px)] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="px-2">
            <DialogHeader className="mb-4">
              <DialogTitle>Adding new Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <>
                <div className="grid grid-cols-[1fr_3fr] items-center">
                  <Label>Date:</Label>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        setDate={(newDate) => field.onChange(newDate)}
                      />
                    )}
                  />
                </div>
                {errors.date && (
                  <p className="text-red-500">{errors.date.message}</p>
                )}
              </>
              <>
                <div className="items-center grid grid-cols-[1fr_3fr]">
                  <Label>Cycle:</Label>
                  <Controller
                    name="cycleId"
                    control={control}
                    render={({ field }) => (
                      <SelectBasic
                        className="w-full"
                        placeholder="Select cycle"
                        defaultValue={field.value}
                        disabled={isLoading}
                        setValue={(value) => field.onChange(value)}
                        options={cycles?.map((cycle) => ({
                          label: cycle.title,
                          value: cycle.id,
                        }))}
                      />
                    )}
                  />
                </div>
                {errors.cycleId && (
                  <p className="text-red-500">{errors.cycleId.message}</p>
                )}
              </>
              <>
                <div className="grid grid-cols-[1fr_3fr] items-center">
                  <Label>Subcycle:</Label>
                  <Controller
                    name="subcycleId"
                    control={control}
                    render={({ field }) => (
                      <SelectBasic
                        className="w-full"
                        placeholder="Select subcycle"
                        disabled={isLoading}
                        defaultValue={field.value}
                        setValue={(value) => field.onChange(value)}
                        options={
                          isLoading
                            ? []
                            : subcycles?.map((subcycle) => ({
                                label: subcycle.title,
                                value: subcycle.id,
                              }))
                        }
                      />
                    )}
                  />
                </div>
                {errors.subcycleId && (
                  <p className="text-red-500">{errors.subcycleId.message}</p>
                )}
              </>
              <>
                <div className="items-center grid grid-cols-[1fr_3fr]">
                  <Label>Category:</Label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <SelectBasic
                        className="w-full"
                        placeholder="Select category"
                        disabled={isLoading}
                        defaultValue={field.value}
                        setValue={(value) => field.onChange(value)}
                        options={
                          isLoading
                            ? []
                            : categories?.map((category) => ({
                                label: category.title,
                                value: category.id,
                              }))
                        }
                      />
                    )}
                  />
                </div>
                {errors.categoryId && (
                  <p className="text-red-500">{errors.categoryId.message}</p>
                )}
              </>
              <>
                <div className="items-center grid grid-cols-[1fr_3fr]">
                  <Label>Amount:</Label>
                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        className="w-full"
                        placeholder="Expense amount"
                        disabled={isLoading}
                        defaultValue={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500">{errors.amount.message}</p>
                )}
              </>
            </div>
            <div className="space-y-2 flex flex-col mt-6">
              <Label>Comment (optional):</Label>
              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <Textarea
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="Comment for this expense"
                  />
                )}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
