"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
import { formSchemaMonthly, formSchemaWeekly, type FormData } from "./schemas";
import { LabelSelect } from "@/components/label/LabelSelect";
import { InfoTooltip } from "@/components/common/InfoTooltip";
import { cn } from "@/lib/utils";
import type { getSubcyclesByCycleIdWithCategories } from "@/types";
import type { Props } from "./types";
import Modal from "../Modal";
import { MobileNumberKeyboard } from "@/components/common/MobileNumberKeyboard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AddNewExpense({
  categoryId,
  monthly = false,
  open,
}: Props) {
  const { selectedCycleId, selectedSubcycleId, cycles, updateCategoryId } =
    useCycleContext();

  const handleClose = () => updateCategoryId(null);

  const defaultValues = {
    date: new Date(),
    cycleId: selectedCycleId || "",
    ...(!monthly && { subcycleId: selectedSubcycleId || "" }),
    categoryId: categoryId || "",
    amount: undefined,
    comment: "",
    label: "",
  };

  const form = useForm<FormData>({
    resolver: zodResolver(monthly ? formSchemaMonthly : formSchemaWeekly),
    defaultValues,
  });

  const { reset, control, handleSubmit, watch } = form;

  const cycleId = watch("cycleId");
  const subcycleId = watch("subcycleId");

  const { data, isLoading } = useGet<getSubcyclesByCycleIdWithCategories>(
    `${URLS.subCyclesWithCategories}?cycleId=${cycleId}`,
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
      mutate(`${URLS.subCyclesTable}?cycleId=${selectedCycleId}`);
      toast.success("Expense added successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error adding expense");
    } finally {
      reset();
      handleClose();
    }
  };

  useEffect(() => {
    reset(defaultValues);
  }, [reset, open]);

  return (
    <Modal
      dialogTitle="New Expense"
      open={open}
      onOpenChange={(open) => !open && handleClose()}
    >
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 sm:space-y-4"
        >
          <Accordion type="single" collapsible>
            <AccordionItem value="1">
              <AccordionTrigger>Details</AccordionTrigger>
              <AccordionContent className="space-y-3 sm:space-y-4">
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
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <FormField
                    name="cycleId"
                    control={control}
                    render={({ field }) => (
                      <FormItem className="flex-1">
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
                        <FormItem className="flex-1">
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
                </div>
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
                  name="label"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className={cn(
                          "text-xs sm:text-sm flex items-center gap-2",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        Label
                        <InfoTooltip text="You can add a label to collect better statistics for your expenses" />
                      </FormLabel>
                      <FormControl>
                        <LabelSelect
                          className={cn(
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={false}
                          setValue={(value) => field.onChange(value)}
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
                        <Input
                          {...field}
                          className="text-sm sm:text-base"
                          placeholder="Comment for this expense"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <FormField
            name="amount"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">Amount</FormLabel>
                <FormControl>
                  <MobileNumberKeyboard
                    value={field.value?.toString() || ""}
                    onChange={(value) => field.onChange(value)}
                    onChangeInput={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full text-sm sm:text-base h-10 sm:h-11"
          >
            Save
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
