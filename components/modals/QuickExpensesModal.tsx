"use client";
import { useEffect, useState, useTransition } from "react";
import Modal from "./Modal";
import { getMainAccount } from "@/app/actions/vault";
import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { addQuickExpenses } from "@/app/actions/expenses";
import { useCycleContext } from "../main/MainTable";
import { toast } from "sonner";
import { URLS } from "@/lib/fetch";

export const QuickExpensesModal = () => {
  const router = useRouter();
  const { selectedCycleId } = useCycleContext();
  const { mutate } = useSWRConfig();

  const [isPending, startTransition] = useTransition();
  const handleClose = () => router.push("/");
  const { data, isLoading } = useSWR("mainAccount", getMainAccount);

  const [inputValue, setInputValue] = useState(0);

  function handleSubmit() {
    startTransition(async () => {
      const result = await addQuickExpenses(inputValue, selectedCycleId);
      if (result?.error) {
        toast.error(result.error);
      }
      toast.success("Quick expenses added successfully");
      mutate(`${URLS.subCyclesTable}?cycleId=${selectedCycleId}`);
      handleClose();
    });
  }

  useEffect(() => {
    if (data) {
      setInputValue(data?.amount || 0);
    }
  }, [data]);

  return (
    <Modal
      open={true}
      onOpenChange={(open) => !open && handleClose()}
      dialogTitle="Add quick expenses"
    >
      <div className="grid grid-cols-2 grid-rows-2">
        <span className="text-lg">Current balance:</span>
        <span className="justify-self-end">{data?.amount}</span>
        <span className="text-lg">New balance: </span>
        <Input
          className="w-[100px] justify-self-end"
          type="number"
          onChange={(e) => setInputValue(Number.parseFloat(e.target.value))}
          value={inputValue}
        />
        <Button
          className="mt-4"
          onClick={handleSubmit}
          disabled={
            isPending ||
            isLoading ||
            inputValue <= 0 ||
            inputValue > (data?.amount || Number.POSITIVE_INFINITY)
          }
        >
          Submit
        </Button>
      </div>
    </Modal>
  );
};
