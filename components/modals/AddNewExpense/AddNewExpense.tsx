"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { URLS } from "@/lib/fetch";
import { useCycleContext } from "@/components/main/MainTable";
import { expensesActions } from "@/app/actions";

import type { Props } from "./types";
import Modal from "../Modal";
import { MobileNumberKeyboard } from "@/components/common/MobileNumberKeyboard";

export default function AddNewExpense({
  categoryId,
  monthly = false,
  open,
}: Props) {
  const { updateCategoryId } = useCycleContext();
  const handleClose = () => {
    updateCategoryId(null);
  };
  const [amount, setAmount] = useState<string>("");

  const { selectedCycleId, selectedSubcycleId } = useCycleContext();

  const defaultValues = {
    date: new Date(),
    cycleId: selectedCycleId || "",
    ...(!monthly && { subcycleId: selectedSubcycleId || "" }),
    categoryId: categoryId || "",
    amount: 0,
    comment: "",
    label: "",
  };

  const { mutate } = useSWRConfig();

  const onSubmit = async () => {
    try {
      const amountValue = Number.parseFloat(amount) || 0;
      await expensesActions.addExpense({
        ...defaultValues,
        amount: amountValue,
        date: defaultValues.date.toISOString(),
      });
      mutate(`${URLS.subCyclesTable}?cycleId=${selectedCycleId}`);
      toast.success("Expense added successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error adding expense");
    } finally {
      setAmount("");
      handleClose();
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  const handleKeyboardChange = (value: string) => {
    setAmount(value);
  };

  return (
    <Modal
      dialogTitle="New Expense"
      open={open}
      onOpenChange={(open) => !open && handleClose()}
    >
      <div className="space-y-3 sm:space-y-4">
        <Input
          className="w-full h-9 sm:h-10 text-base hidden sm:block"
          type="number"
          placeholder="Expense amount"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
        />

        {/* Mobile Number Keyboard - Only visible on mobile */}
        <div className="block sm:hidden">
          <MobileNumberKeyboard
            value={amount}
            onChange={handleKeyboardChange}
            onChangeInput={handleAmountChange}
            className="mt-4"
          />
        </div>

        <Button
          type="button"
          onClick={onSubmit}
          className="w-full text-sm sm:text-base h-10 sm:h-11"
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}
