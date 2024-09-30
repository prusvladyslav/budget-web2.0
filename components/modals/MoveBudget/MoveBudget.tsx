"use client";
import { useForm } from "react-hook-form";

import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { URLS, useGet } from "@/lib/fetch";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { useRouter } from "next/navigation";
import { Props } from "./types";
import { useCycleContext } from "@/components/main/MainTable";
import { formSchemaMonthly, formSchemaWeekly, FormData } from "./schemas";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SelectBasic from "@/components/common/SelectBasic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { moveBudget } from "@/app/actions/categories";
import { MultiSelect } from "@/components/ui/multi-select";
import { getSubcyclesByCycleIdWithCategories } from "@/types";

export default function MoveBudget({
  categoryId,
  monthly = false,
  open,
}: Props) {
  const router = useRouter();

  const handleClose = () => router.push("/");

  const { selectedCycleId, selectedSubcycleId, cycles } = useCycleContext();

  const defaultValues = {
    cycleId: selectedCycleId || "",
    ...(!monthly && { subcycleFromId: selectedSubcycleId || "" }),
    categoryFromId: categoryId ? [categoryId] : [],
    subcycleToId: "",
    categoryToId: "",
    amount: undefined,
  };

  const form = useForm<FormData>({
    resolver: zodResolver(monthly ? formSchemaMonthly : formSchemaWeekly),
    defaultValues,
  });

  const { reset, control, handleSubmit, watch } = form;

  const cycledId = watch("cycleId");
  const subcycleFromId = watch("subcycleFromId");
  const categoryFromId = watch("categoryFromId");

  const subcycleToId = watch("subcycleToId");

  const { data, isLoading } = useGet<getSubcyclesByCycleIdWithCategories>(
    open ? URLS.subCyclesWithCategories + "?cycleId=" + cycledId : null,
    "subcyclesWithCategories"
  );

  const subcycles = data?.data.subcycles;

  const categoriesData = data?.data.categories[monthly ? "monthly" : "weekly"];

  const categoriesFrom = monthly
    ? categoriesData
    : categoriesData?.filter(
        (category) => category.subcycleId === subcycleFromId
      );

  const categoriesTo = monthly
    ? categoriesData
    : categoriesData?.filter(
        (category) => category.subcycleId === subcycleToId
      );

  const [isPending, startTransition] = useTransition();

  const { mutate } = useSWRConfig();

  const onSubmit = async (data: FormData) => {
    try {
      startTransition(async () => {
        await moveBudget(data);
        mutate(() => true);
        toast.success(`Budget moved successfully`);
      });
    } catch (error) {
      console.error(error);
      toast.error(`Error moving budget`);
    } finally {
      reset();
      handleClose();
    }
  };

  useEffect(() => {
    reset(defaultValues);
  }, [reset, open]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] p-0">
        <ScrollArea className="max-h-[calc(100vh-20px)] p-8">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="px-2">
              <DialogHeader className="mb-4">
                <DialogTitle>Moving budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <FormField
                  name="cycleId"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[1fr_3fr] items-center md:block">
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

                <Separator />

                {!monthly && (
                  <FormField
                    name="subcycleFromId"
                    control={control}
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[1fr_3fr] items-center md:block">
                        <FormLabel>Subcycle From:</FormLabel>
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
                )}

                <FormField
                  name="categoryFromId"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[1fr_3fr] items-center md:block">
                      <FormLabel>Category From:</FormLabel>
                      <FormControl>
                        <MultiSelect
                          className="w-full"
                          placeholder="Select category"
                          disabled={isLoading}
                          defaultValue={field.value}
                          onValueChange={(value) => field.onChange(value)}
                          options={
                            isLoading
                              ? []
                              : categoriesFrom
                              ? categoriesFrom?.map((category) => ({
                                  label: category.title,
                                  value: category.id,
                                }))
                              : []
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {categoryFromId.length && (
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-base">
                      Current categories amounts
                    </span>
                    {categoriesData &&
                      categoriesData
                        .filter((category) =>
                          categoryFromId?.includes(category.id)
                        )
                        .map((category) => {
                          return (
                            <div
                              className="flex justify-between text-sm"
                              key={category.id}
                            >
                              <div>{category.title}:</div>
                              <div>{category.currentAmount}</div>
                            </div>
                          );
                        })}
                  </div>
                )}
                <Separator />
                {!monthly && (
                  <FormField
                    name="subcycleToId"
                    control={control}
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[1fr_3fr] items-center md:block">
                        <FormLabel>Subcycle To:</FormLabel>
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
                                : subcycles
                                    ?.filter(
                                      (subcycle) =>
                                        subcycle.id !== subcycleFromId
                                    )
                                    .map((subcycle) => ({
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
                )}

                <FormField
                  name="categoryToId"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[1fr_3fr] items-center md:block">
                      <FormLabel>Category To:</FormLabel>
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
                              : categoriesTo?.map((category) => ({
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
                <Separator />

                <FormField
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[1fr_3fr] items-center md:block">
                      <FormLabel>Amount:</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          type="number"
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
              </div>
              <DialogFooter className="mt-4">
                <Button disabled={isPending} type="submit">
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
