"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import DatePicker from "@/components/common/DatePicker";
import SelectBasic from "@/components/common/SelectBasic";
import { URLS, useGet } from "@/lib/fetch";
import { useCycleContext } from "@/components/main/MainTable";
import { expensesActions } from "@/app/actions";
import { getSubcyclesByCycleIdWithCategories, Props } from "./types";
import { formSchemaMonthly, formSchemaWeekly, FormData } from "./schemas";

export default function AddNewExpense({
  categoryId,
  monthly = false,
  open,
}: Props) {
  const router = useRouter();
  const handleClose = () => router.push("/");
  const { selectedCycleId, selectedSubcycleId, cycles } = useCycleContext();

  const defaultValues = {
    date: new Date(),
    cycleId: selectedCycleId || "",
    ...(!monthly && { subcycleId: selectedSubcycleId || "" }),
    categoryId: categoryId || "",
    amount: undefined,
    comment: "",
  };

  const form = useForm<FormData>({
    resolver: zodResolver(monthly ? formSchemaMonthly : formSchemaWeekly),
    defaultValues,
  });

  const { reset, control, handleSubmit, watch } = form;

  const cycleId = watch("cycleId");
  const subcycleId = watch("subcycleId");

  const { data, isLoading } = useGet<getSubcyclesByCycleIdWithCategories>(
    URLS.subCyclesWithCategories + "?cycleId=" + cycleId,
    "subcyclesWithCategories"
  );

  const subcycles = data?.data.subcycles;
  const categoriesData = data?.data.categories[monthly ? "monthly" : "weekly"];
  const categories = monthly
    ? categoriesData
    : categoriesData?.filter((category) => category.subcycleId === subcycleId);

  const { mutate } = useSWRConfig();

  const onSubmit = async (data: FormData) => {
    try {
      await expensesActions.addExpense({
        ...data,
        date: data.date.toISOString(),
      });
      mutate(() => true);
      toast.success("Expense added successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error adding expense");
    } finally {
      reset();
      handleClose();
    }
  };

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    reset(defaultValues);
    if (open && categoryId) {
      requestAnimationFrame(() => {
        setTimeout(() => amountInputRef.current?.focus(), 0);
      });
    }
  }, [reset, open, categoryId]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-4 sm:p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg sm:text-xl">
                New Expense
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          className="w-full"
                          date={field.value}
                          setDate={(newDate) => field.onChange(newDate)}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="cycleId"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">
                        Cycle
                      </FormLabel>
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
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {!monthly && (
                  <FormField
                    name="subcycleId"
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">
                          Subcycle
                        </FormLabel>
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">
                        Category
                      </FormLabel>
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
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">
                        Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          ref={amountInputRef}
                          className="w-full h-8 sm:h-9"
                          type="number"
                          placeholder="Expense amount"
                          disabled={isLoading}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="comment"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">
                        Comment (optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="text-xs sm:text-sm h-20 resize-none"
                          placeholder="Comment for this expense"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full text-xs sm:text-sm h-8 sm:h-9"
                >
                  Save Expense
                </Button>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
