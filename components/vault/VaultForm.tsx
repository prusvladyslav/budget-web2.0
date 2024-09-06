"use client";

import { useEffect, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { valutActions } from "@/app/actions";
import {} from "next/cache";
import { SelectVault } from "@/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  isMain: z.boolean(),
  amount: z.number().min(0, "Amount must be a positive number"),
  currency: z.string().min(1, "Currency is required"),
});

const formSchema = z.object({
  accounts: z
    .array(accountSchema)
    .min(1, "At least one account is required")
    .refine(
      (accounts) => accounts.filter((account) => account.isMain).length <= 1,
      "Only one account can be set as main"
    ),
});

type FormData = z.infer<typeof formSchema>;

const currencies = [
  { value: "USD", label: "$" },
  { value: "EUR", label: "€" },
  { value: "UAH", label: "₴" },
  { value: "PLN", label: "zł" },
];

export default function VaultForm({
  accounts,
}: {
  accounts: SelectVault[] | null;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accounts: accounts?.length
        ? accounts
        : [{ name: "", isMain: false, amount: 0, currency: "UAH" }],
    },
  });

  const [isPending, startTransition] = useTransition();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "accounts",
  });

  const watchAccounts = watch("accounts");

  useEffect(() => {
    const mainAccountIndex = watchAccounts.findIndex(
      (account) => account.isMain
    );
    if (mainAccountIndex === -1 && watchAccounts.length > 0) {
      setValue(`accounts.0.isMain`, true);
    }
  }, [watchAccounts, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      startTransition(async () => {
        await valutActions.updateAccounts(data.accounts);
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:w-3/4">
      <Card>
        <CardHeader>
          <CardTitle>Vault Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            return (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Controller
                      name={`accounts.${index}.isMain`}
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={(value) => {
                            if (value === "main") {
                              watchAccounts.forEach((_, i) => {
                                if (i !== index) {
                                  setValue(`accounts.${i}.isMain`, false);
                                }
                              });
                            }
                            field.onChange(value === "main");
                          }}
                          value={field.value ? "main" : "regular"}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="main"
                              id={`radio-main-${index}`}
                            />
                            <Label htmlFor={`radio-main-${index}`}>
                              Main Account
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={watchAccounts.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`accounts.${index}.name`}>
                        Account Name
                      </Label>
                      <Controller
                        name={`accounts.${index}.name`}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} placeholder="Enter account name" />
                        )}
                      />
                      {errors.accounts?.[index]?.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.accounts[index].name.message}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <Label htmlFor={`accounts.${index}.amount`}>
                          Amount
                        </Label>
                        <Controller
                          name={`accounts.${index}.amount`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              placeholder="Enter amount"
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          )}
                        />
                        {errors.accounts?.[index]?.amount && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.accounts[index].amount.message}
                          </p>
                        )}
                      </div>
                      <div className="w-1/5">
                        <Label htmlFor={`accounts.${index}.currency`}>
                          Currency
                        </Label>
                        <Controller
                          name={`accounts.${index}.currency`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map(({ value, label }) => (
                                  <SelectItem key={value} value={value}>
                                    <span className="text-md">{label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.accounts?.[index]?.currency && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.accounts[index].currency.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ name: "", isMain: false, amount: 0, currency: "UAH" })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
          <Button type="submit" disabled={isPending}>
            Submit
          </Button>
        </CardFooter>
      </Card>
      {errors.accounts && (
        <p className="text-sm text-red-500 text-center">
          {errors.accounts.message}
        </p>
      )}
    </form>
  );
}
