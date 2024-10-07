"use client";
import SelectBasic from "@/components/common/SelectBasic";
import type { SelectCycle } from "@/db/schema";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  cycles: SelectCycle[];
  lastOpenedCycleId: string | null;
};

export default function StatsSelectCycle({ cycles, lastOpenedCycleId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const cycleId = searchParams.get("cycleId");

  const options = cycles.map((cycle) => ({
    label: cycle.title,
    value: cycle.id,
  }));

  return (
    <SelectBasic
      className="w-fit min-w-[160px]"
      placeholder="Select cycle"
      options={options}
      disabled={false}
      value={cycleId || lastOpenedCycleId || ""}
      setValue={(value) => router.push(`${pathname}?cycleId=${value}`)}
    />
  );
}
