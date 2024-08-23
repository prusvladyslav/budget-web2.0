"use client";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { reset, control, handleSubmit, watch, setFocus } = form;

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

  useEffect(() => {
    setFocus("amount", { shouldSelect: true });
  }, [setFocus]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <AddExpenseButton />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <ScrollArea className="max-h-[calc(100vh-20px)] p-8">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="px-2">
              <DialogHeader className="mb-4">
                <DialogTitle>Adding new Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <FormField
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date:</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={(newDate) => field.onChange(newDate)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="cycleId"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle:</FormLabel>
                      <FormControl>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="subcycleId"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcycle:</FormLabel>
                      <FormControl>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category:</FormLabel>
                      <FormControl>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount:</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="Expense amount"
                          disabled={isLoading}
                          defaultValue={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="comment"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment (optional):</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Comment for this expense"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
